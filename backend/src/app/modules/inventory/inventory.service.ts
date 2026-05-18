import { MovementType, Prisma } from '../../../generated/client';
import { InventoryRepository } from './inventory.repository';
import { AppError } from '../../errors/AppError';
import { AuditService } from '../audit/audit.service';
import { DomainEvents, emitDomainEvent } from '../../../shared/events/domain-events';
import { prisma } from '../../lib/prisma';
import { ValuationService } from './valuation.service';
import { AlertService } from './alert.service';

export class InventoryService {
  private auditService: AuditService;
  private valuationService: ValuationService;

  constructor(private inventoryRepo: InventoryRepository) {
    this.auditService = new AuditService();
    this.valuationService = new ValuationService();
  }

  async getInventory(params: { businessId: string; itemId?: string; warehouseId?: string; batchId?: string }) {
    return await this.inventoryRepo.findMany(params);
  }

  /**
   * Rule 4: NEVER Mutate Inventory Directly.
   * This method handles StockMovement -> Recalculate -> Commit.
   */
  async adjustStock(params: {
    businessId: string;
    itemId: string;
    warehouseId: string;
    quantity: number;
    type: MovementType;
    unitCost?: number; // Optional: influence WAC for manual STOCK_IN
    reason?: string;
    reference?: string;
    tx?: Prisma.TransactionClient;
    batchId?: string;
  }) {
    const { businessId, itemId, warehouseId, quantity, type, unitCost, tx: providedTx, batchId } = params;

    try {
      // Rule 13: Transaction Safety. Wrap all related operations in a transaction.
      return await (providedTx || prisma).$transaction(async (tx: Prisma.TransactionClient) => {
        const repo = new InventoryRepository(tx);

        // 1. Get current inventory
        let inventory = await repo.findByProductAndWarehouse({
          businessId,
          itemId,
          warehouseId,
          batchId,
        });

        // 2. If doesn't exist, create it (Lazy Initialization)
        if (!inventory) {
          inventory = await repo.create({
            businessId,
            itemId,
            warehouseId,
            batchId,
            availableStock: 0,
            totalStock: 0,
          });
        }

        // 3. Update Valuation BEFORE stock update if unitCost is provided
        // This ensures currentTotalStock in ValuationService is the OLD stock
        if (unitCost !== undefined && quantity > 0) {
          await this.valuationService.updateWAC({
            businessId,
            itemId,
            addedQuantity: quantity,
            unitCost,
            reference: params.reference,
            tx
          });
        }

        // 4. Create StockMovement (Audit Trail)
        await repo.createMovement({
          businessId,
          inventoryId: inventory.id,
          itemId,
          type,
          quantity,
          unitCost,
          reason: params.reason,
          reference: params.reference,
        });

        // 5. Calculate new stock
        // For simple adjustment, we assume it's available stock
        const newStock = inventory.availableStock + quantity;

        if (newStock < 0) {
          throw new AppError('Insufficient stock for this operation', 400);
        }

        // 6. Commit with Optimistic Locking (Rule 11)
        const result = await repo.updateStockFields({
          id: inventory.id,
          businessId,
          availableDelta: quantity,
          totalDelta: quantity,
          version: inventory.version,
        });

        // 7. Record snapshot with new WAC/current WAC
        const item = await tx.item.findUnique({
          where: { id: itemId },
          select: { costPrice: true }
        });

        await this.valuationService.recordSnapshot({
          businessId,
          itemId,
          quantity: result.totalStock,
          unitCost: Number(item?.costPrice || 0),
          reference: params.reference,
          tx
        });

        // 8. Log Audit
        await this.auditService.log({
          businessId,
          action: `STOCK_ADJUSTMENT_${type}`,
          entityType: 'Inventory',
          entityId: inventory.id,
          previousData: { availableStock: inventory.availableStock, totalStock: inventory.totalStock },
          newData: { availableStock: result.availableStock, totalStock: result.totalStock },
          tx,
        });

        // 9. Emit Domain Event if it's a deduction (for COGS tracking)
        if (quantity < 0) {
          await emitDomainEvent(tx, DomainEvents.INVENTORY_DEDUCTED, {
            orderId: params.reference,
            businessId,
            itemId,
            quantity: Math.abs(quantity),
            costPrice: item?.costPrice || 0
          }, businessId, 'Inventory', inventory.id);
        }

        // 10. Check for Low Stock Alert
        const alertService = new AlertService();
        await alertService.checkItemLowStock(businessId, itemId);

        return result;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409);
      }
      throw error;
    }
  }

  /**
   * Phase 5: Inventory Reservation System
   * Reserves stock for a PENDING order.
   * Decreases availableStock, Increases reservedStock.
   */
  async reserveStock(params: {
    businessId: string;
    orderId: string;
    items: { itemId: string; warehouseId: string; quantity: number }[];
    tx?: Prisma.TransactionClient;
  }) {
    const { businessId, orderId, items, tx: providedTx } = params;

    try {
      return await (providedTx || prisma).$transaction(async (tx: Prisma.TransactionClient) => {
        const repo = new InventoryRepository(tx);

        // Rule 11: Group by Item + Warehouse to prevent optimistic locking conflicts
        const groupedItems = items.reduce((acc, item) => {
          const key = `${item.itemId}_${item.warehouseId}`;
          if (!acc[key]) {
            acc[key] = { itemId: item.itemId, warehouseId: item.warehouseId, quantity: 0 };
          }
          acc[key].quantity += item.quantity;
          return acc;
        }, {} as Record<string, { itemId: string; warehouseId: string; quantity: number }>);

        for (const item of Object.values(groupedItems)) {
          const inventory = await repo.findByProductAndWarehouse({
            businessId,
            itemId: item.itemId,
            warehouseId: item.warehouseId,
          });

          if (!inventory || Number(inventory.availableStock) < item.quantity) {
            throw new AppError(`Insufficient stock for item: ${item.itemId}. Available: ${inventory?.availableStock || 0}, Requested: ${item.quantity}`, 400);
          }

          // 1. Move from Available to Reserved
          await repo.updateStockFields({
            id: inventory.id,
            businessId,
            availableDelta: -item.quantity,
            reservedDelta: item.quantity,
            version: inventory.version,
          });

          // 2. Create Reservation record
          await tx.stockReservation.create({
            data: {
              businessId,
              inventoryId: inventory.id,
              orderId,
              quantity: item.quantity,
              expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min default
            },
          });
        }

        // 3. Emit Event (Delayed release handled by BullMQ)
        await emitDomainEvent(tx, DomainEvents.INVENTORY_RESERVED, {
          orderId,
          businessId,
          items: items.map(i => ({ itemId: i.itemId, quantity: i.quantity }))
        }, businessId, 'Order', orderId);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409);
      }
      throw error;
    }
  }

  /**
   * Releases all reservations for a given order if they haven't been confirmed.
   * Useful for auto-release after 15 minutes.
   */
  async releaseOrderReservations(orderId: string, businessId: string, tx?: Prisma.TransactionClient) {
    try {
      return await (tx || prisma).$transaction(async (innerTx: Prisma.TransactionClient) => {
        const reservations = await innerTx.stockReservation.findMany({
          where: { orderId, businessId },
          include: { inventory: true }
        });

        if (reservations.length === 0) return;

        const repo = new InventoryRepository(innerTx);

        const groupedReservations = reservations.reduce((acc, res) => {
          if (!acc[res.inventoryId]) {
            acc[res.inventoryId] = {
              quantity: 0,
              version: res.inventory.version
            };
          }
          acc[res.inventoryId].quantity += res.quantity;
          return acc;
        }, {} as Record<string, { quantity: number; version: number }>);

        for (const [inventoryId, data] of Object.entries(groupedReservations) as [string, { quantity: number; version: number }][]) {
          // Move from Reserved to Available
          await repo.updateStockFields({
            id: inventoryId,
            businessId,
            availableDelta: data.quantity,
            reservedDelta: -data.quantity,
            version: data.version,
          });
        }

        // Delete all reservation records for this order
        await innerTx.stockReservation.deleteMany({ where: { orderId, businessId } });

        // Emit event
        await emitDomainEvent(innerTx, DomainEvents.INVENTORY_RELEASED, {
          orderId,
          reason: 'Expired or Cancelled'
        }, businessId, 'Order', orderId);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409);
      }
      throw error;
    }
  }

  /**
   * Releases a reservation if it expires or order is cancelled.
   * Decreases reservedStock, Increases availableStock.
   */
  async releaseReservation(reservationId: string, businessId: string, tx?: Prisma.TransactionClient) {
    try {
      return await (tx || prisma).$transaction(async (innerTx: Prisma.TransactionClient) => {
        const repo = new InventoryRepository(innerTx);
        const reservation = await repo.findReservationById(reservationId, businessId);

        if (!reservation) return;

        // 1. Move from Reserved to Available
        await repo.updateStockFields({
          id: reservation.inventoryId,
          businessId,
          availableDelta: reservation.quantity,
          reservedDelta: -reservation.quantity,
          version: reservation.inventory.version,
        });

        // 2. Delete reservation record
        await repo.deleteReservation(reservationId);

        // 3. Emit event
        await emitDomainEvent(innerTx, DomainEvents.INVENTORY_RELEASED, {
          reservationId,
          orderId: reservation.orderId,
          reason: 'Expired or Cancelled'
        }, businessId, 'Inventory', reservation.inventoryId);
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409);
      }
      throw error;
    }
  }

  /**
   * Confirms a reservation when payment is successful.
   * Decreases reservedStock, Decreases totalStock.
   */
  async confirmStockReservation(orderId: string, businessId: string, tx?: Prisma.TransactionClient) {
    try {
      return await (tx || prisma).$transaction(async (innerTx: Prisma.TransactionClient) => {
        const reservations = await innerTx.stockReservation.findMany({
          where: { orderId, businessId },
          include: { inventory: true }
        });

        const repo = new InventoryRepository(innerTx);

        const groupedReservations = reservations.reduce((acc, res) => {
          if (!acc[res.inventoryId]) {
            acc[res.inventoryId] = {
              quantity: 0,
              version: res.inventory.version
            };
          }
          acc[res.inventoryId].quantity += res.quantity;
          return acc;
        }, {} as Record<string, { quantity: number; version: number }>);

        for (const [inventoryId, data] of Object.entries(groupedReservations) as [string, { quantity: number; version: number }][]) {
          // 1. Finalize deduction: Decrease Reserved and Total
          await repo.updateStockFields({
            id: inventoryId,
            businessId,
            reservedDelta: -data.quantity,
            totalDelta: -data.quantity,
            version: data.version,
          });
        }

        // 2. Delete reservations
        await innerTx.stockReservation.deleteMany({ where: { orderId, businessId } });

        // 3. Emit Deduction event for COGS
        for (const res of reservations) {
          // Fetch current cost price for correct COGS
          const item = await innerTx.item.findUnique({
            where: { id: res.inventory.itemId },
            select: { costPrice: true }
          });

          await emitDomainEvent(innerTx, DomainEvents.INVENTORY_DEDUCTED, {
            orderId,
            businessId,
            itemId: res.inventory.itemId,
            quantity: res.quantity,
            costPrice: item?.costPrice || 0
          }, businessId, 'Inventory', res.inventoryId);
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409);
      }
      throw error;
    }
  }
}
