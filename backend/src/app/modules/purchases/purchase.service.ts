import { PurchaseRepository } from './purchase.repository';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryRepository } from '../inventory/inventory.repository';
import { AppError } from '../../errors/AppError';
import { MovementType, Prisma, PurchaseStatus } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class PurchaseService {
  private purchaseRepository: PurchaseRepository;
  private inventoryService: InventoryService;

  constructor() {
    this.purchaseRepository = new PurchaseRepository();
    this.inventoryService = new InventoryService(new InventoryRepository());
  }

  async createPurchase(businessId: string, data: any) {
    // Calculate total if not provided
    if (!data.total) {
      data.total = data.items.reduce((acc: number, item: any) => {
        return acc + (item.quantity * item.unitCost);
      }, 0);
    }

    return this.purchaseRepository.create({
      ...data,
      businessId,
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

      // 2. Update inventory for each item
      for (const item of purchase.items) {
        await this.inventoryService.adjustStock({
          businessId,
          itemId: item.itemId,
          warehouseId,
          quantity: item.quantity,
          type: MovementType.IN,
          reason: `Stock received from Purchase Order: ${id}`,
          reference: id,
          tx,
        });
      }

      return updatedPurchase;
    });
  }

  async cancelPurchase(id: string, businessId: string) {
    const purchase = await this.getPurchaseById(id, businessId);
    if (purchase.status !== PurchaseStatus.PENDING) {
      throw new AppError(`Cannot cancel purchase order with status: ${purchase.status}`, 400);
    }
    return this.purchaseRepository.updateStatus(id, businessId, PurchaseStatus.CANCELLED);
  }
}
