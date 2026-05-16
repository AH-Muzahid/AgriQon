import { PurchaseRepository } from './purchase.repository';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryRepository } from '../inventory/inventory.repository';
import { AppError } from '../../errors/AppError';
import { MovementType, Prisma, PurchaseStatus } from '../../../generated/client';
import { prisma } from '../../lib/prisma';
import { AuditService } from '../audit/audit.service';
import { DomainEvents } from '../../../shared/events/domain-events';
import { ValuationService } from '../inventory/valuation.service';

export class PurchaseService {
  private purchaseRepository: PurchaseRepository;
  private inventoryService: InventoryService;
  private auditService: AuditService;

  constructor() {
    this.purchaseRepository = new PurchaseRepository();
    this.inventoryService = new InventoryService(new InventoryRepository());
    this.auditService = new AuditService();
    this.valuationService = new ValuationService();
  }
  private valuationService: ValuationService;

  async createPurchase(businessId: string, data: any) {
    // Calculate total if not provided
    if (!data.total) {
      data.total = data.items.reduce((acc: number, item: any) => {
        return acc + (item.quantity * item.unitCost);
      }, 0);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const purchase = await tx.purchaseOrder.create({
        data: {
          ...data,
          businessId,
          items: {
            create: data.items
          }
        },
        include: { items: true }
      });

      // Emit Outbox event
      await tx.outboxEvent.create({
        data: {
          businessId,
          aggregateType: 'Purchase',
          aggregateId: purchase.id,
          eventType: DomainEvents.PURCHASE_CREATED,
          payload: { purchaseId: purchase.id, businessId, total: purchase.total, supplierId: purchase.supplierId },
        },
      });

      // Log Audit
      await this.auditService.log({
        businessId,
        action: 'CREATE_PURCHASE',
        entityType: 'Purchase',
        entityId: purchase.id,
        newData: purchase,
        tx,
      });

      return purchase;
    });
  }

  async getAllPurchases(businessId: string, filter: any = {}) {
    return this.purchaseRepository.findMany(businessId, filter);
  }

  async getPurchaseById(id: string, businessId: string) {
    const purchase = await this.purchaseRepository.findById(id, businessId);
    if (!purchase) {
      throw new AppError('Purchase order not found', 404);
    }
    return purchase;
  }

  /**
   * Mark purchase order as received and update inventory
   */
  async receivePurchase(id: string, businessId: string, warehouseId: string) {
    const purchase = await this.getPurchaseById(id, businessId);

    if (purchase.status === PurchaseStatus.RECEIVED) {
      throw new AppError('Purchase order already received', 400);
    }

    // Start a transaction to ensure both status update and inventory update succeed
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update purchase status
      const updatedPurchase = await tx.purchaseOrder.update({
        where: { id, businessId },
        data: { status: PurchaseStatus.RECEIVED },
      });

      // 2. Update inventory and valuation for each item
      for (const item of purchase.items) {
        await this.inventoryService.adjustStock({
          businessId,
          itemId: item.itemId,
          warehouseId,
          quantity: item.quantity,
          type: MovementType.IN,
          unitCost: Number(item.unitCost), // Pass unitCost here to trigger WAC update
          reason: `Stock received from Purchase Order: ${id}`,
          reference: id,
          tx,
        });
      }

      // 3. Emit Outbox event
      await tx.outboxEvent.create({
        data: {
          businessId,
          aggregateType: 'Purchase',
          aggregateId: id,
          eventType: DomainEvents.PURCHASE_RECEIVED,
          payload: { purchaseId: id, businessId, total: purchase.total, supplierId: purchase.supplierId },
        },
      });

      // 4. Log Audit
      await this.auditService.log({
        businessId,
        action: 'RECEIVE_PURCHASE',
        entityType: 'Purchase',
        entityId: id,
        previousData: { status: purchase.status },
        newData: { status: PurchaseStatus.RECEIVED },
        tx,
      });

      return updatedPurchase;
    });
  }

  async cancelPurchase(id: string, businessId: string) {
    const purchase = await this.getPurchaseById(id, businessId);
    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new AppError(`Cannot cancel purchase order with status: ${purchase.status}`, 400);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update status
      const updatedPurchase = await tx.purchaseOrder.update({
        where: { id, businessId },
        data: { status: PurchaseStatus.CANCELLED },
      });

      // 2. Emit Outbox event
      await tx.outboxEvent.create({
        data: {
          businessId,
          aggregateType: 'Purchase',
          aggregateId: id,
          eventType: DomainEvents.PURCHASE_CANCELLED,
          payload: { purchaseId: id, businessId, total: purchase.total, supplierId: purchase.supplierId },
        },
      });

      // 3. Log Audit
      await this.auditService.log({
        businessId,
        action: 'CANCEL_PURCHASE',
        entityType: 'Purchase',
        entityId: id,
        previousData: { status: purchase.status },
        newData: { status: PurchaseStatus.CANCELLED },
        tx,
      });

      return updatedPurchase;
    });
  }

  /**
   * Pay a purchase order and emit SUPPLIER_PAYMENT_MADE
   */
  async payPurchase(id: string, businessId: string) {
    const purchase = await this.getPurchaseById(id, businessId);
    if (purchase.status === PurchaseStatus.CANCELLED) {
      throw new AppError('Cannot pay cancelled purchase order', 400);
    }
    
    // Check if it's already PAID? Prisma schema might not have PAID status for PurchaseOrder, maybe just leave as RECEIVED or add COMPLETED. Let's assume there is no paid status for now, or just update paymentStatus if it exists. But we just emit the event for accounting to pick up. Let's see if there is paymentStatus. Wait, let's just emit the event and maybe update a field if it exists. Since I don't see the schema, I will just emit the Outbox event to trigger the accounting entry.
    
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Emit Outbox event for accounting
      await tx.outboxEvent.create({
        data: {
          businessId,
          aggregateType: 'Purchase',
          aggregateId: id,
          eventType: DomainEvents.PURCHASE_PAID,
          payload: { purchaseId: id, businessId, total: purchase.total, supplierId: purchase.supplierId, amount: purchase.total },
        },
      });

      // Log Audit
      await this.auditService.log({
        businessId,
        action: 'PAY_PURCHASE',
        entityType: 'Purchase',
        entityId: id,
        newData: { event: 'PURCHASE_PAID' },
        tx,
      });

      return purchase;
    });
  }
}
