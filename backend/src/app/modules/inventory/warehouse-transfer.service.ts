import { MovementType, Prisma } from '../../../generated/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import { InventoryService } from './inventory.service';
import { WarehouseTransferRepository } from './warehouse-transfer.repository';
import { DomainEvents } from '../../../shared/events/domain-events';

export class WarehouseTransferService {
  private transferRepo: WarehouseTransferRepository;

  constructor(private inventoryService: InventoryService) {
    this.transferRepo = new WarehouseTransferRepository();
  }

  async initiateTransfer(params: {
    businessId: string;
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    items: { itemId: string; quantity: number; batchId?: string }[];
  }) {
    const { businessId, sourceWarehouseId, destinationWarehouseId, items } = params;

    // 1. Basic Validation
    if (sourceWarehouseId === destinationWarehouseId) {
      throw new AppError('Source and destination warehouses must be different', 400);
    }

    if (!items || items.length === 0) {
      throw new AppError('Transfer must include at least one item', 400);
    }

    // 2. Verify warehouse ownership
    const warehouses = await prisma.warehouse.findMany({
      where: {
        id: { in: [sourceWarehouseId, destinationWarehouseId] },
        businessId
      }
    });

    if (warehouses.length !== 2) {
      throw new AppError('Invalid warehouses or unauthorized access', 403);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create Transfer Record
      const transfer = await new WarehouseTransferRepository(tx).create({
        businessId,
        sourceId: sourceWarehouseId,
        destinationId: destinationWarehouseId,
        status: 'PENDING',
        items,
      });

      // 2. Deduct from source warehouse
      for (const item of items) {
        await this.inventoryService.adjustStock({
          businessId,
          itemId: item.itemId,
          warehouseId: sourceWarehouseId,
          quantity: -item.quantity,
          type: MovementType.TRANSFER,
          reason: `Warehouse Transfer OUT #${transfer.id}`,
          reference: transfer.id,
          tx,
          batchId: item.batchId,
        });
      }

      return transfer;
    });
  }

  async completeTransfer(businessId: string, transferId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const transfer = await new WarehouseTransferRepository(tx).findSecureById(transferId, businessId);

      if (!transfer) throw new AppError('Transfer not found', 404);
      if (transfer.status === 'COMPLETED') throw new AppError('Transfer already completed', 400);

      // 1. Add to destination warehouse
      let totalValue = 0;
      for (const tItem of transfer.items) {
        await this.inventoryService.adjustStock({
          businessId,
          itemId: tItem.itemId,
          warehouseId: transfer.destinationId,
          quantity: tItem.quantity,
          type: MovementType.TRANSFER,
          reason: `Warehouse Transfer IN #${transfer.id}`,
          reference: transfer.id,
          tx,
          batchId: tItem.batchId || undefined,
        });
        
        // Calculate total value for accounting (using current cost price)
        totalValue += Number(tItem.item.costPrice || 0) * tItem.quantity;
      }

      // 2. Update status
      await new WarehouseTransferRepository(tx).updateStatus(transferId, businessId, 'COMPLETED');

      // 3. Emit Domain Event for Accounting
      await tx.outboxEvent.create({
        data: {
          businessId,
          aggregateType: 'WarehouseTransfer',
          aggregateId: transferId,
          eventType: DomainEvents.WAREHOUSE_TRANSFER_COMPLETED,
          payload: {
            transferId,
            businessId,
            totalValue,
            sourceWarehouseId: transfer.sourceId,
            destinationWarehouseId: transfer.destinationId
          }
        }
      });

      return transfer;
    });
  }

  async getTransfers(businessId: string) {
    return this.transferRepo.findMany(businessId);
  }
}
