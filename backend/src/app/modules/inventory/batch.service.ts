import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import { Prisma } from '../../../generated/client';

export class BatchService {
  /**
   * Create a new batch for an item and optionally initialize inventory in a warehouse.
   */
  async createBatch(params: {
    businessId: string;
    itemId: string;
    batchNumber: string;
    expiryDate?: Date;
    warehouseId?: string;
    initialStock?: number;
    tx?: Prisma.TransactionClient;
  }) {
    const { businessId, itemId, batchNumber, expiryDate, warehouseId, initialStock, tx: providedTx } = params;

    return await (providedTx || prisma).$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Verify item exists and belongs to business
      const item = await tx.item.findFirst({
        where: { id: itemId, businessId }
      });

      if (!item) {
        throw new AppError('Item not found', 404);
      }

      // 2. Check if batch number already exists for this item
      const existingBatch = await tx.productBatch.findFirst({
        where: { itemId, batchNumber }
      });

      if (existingBatch) {
        throw new AppError(`Batch ${batchNumber} already exists for this item`, 400);
      }

      // 3. Create the batch
      const batch = await tx.productBatch.create({
        data: {
          businessId,
          itemId,
          batchNumber,
          expiryDate
        }
      });

      // 4. If warehouseId is provided, initialize inventory for this batch
      if (warehouseId) {
        await tx.inventory.create({
          data: {
            businessId,
            itemId,
            warehouseId,
            batchId: batch.id,
            availableStock: initialStock || 0,
            totalStock: initialStock || 0
          }
        });

        // If initial stock is > 0, record a movement
        if (initialStock && initialStock > 0) {
          await tx.stockMovement.create({
            data: {
              businessId,
              inventoryId: (await tx.inventory.findUnique({
                where: { warehouseId_itemId_batchId: { warehouseId, itemId, batchId: batch.id } }
              }))!.id,
              itemId,
              type: 'IN',
              quantity: initialStock,
              reason: 'Initial batch stock',
              unitCost: item.costPrice
            }
          });
        }
      }

      return batch;
    });
  }

  /**
   * Find batches near expiry
   */
  async getExpiringBatches(businessId: string, withinDays: number = 30) {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + withinDays);

    return await prisma.batch.findMany({
      where: {
        item: { businessId },
        expiryDate: {
          lte: expiryThreshold,
          gte: new Date() // Not yet expired
        },
        inventory: {
          some: {
            availableStock: { gt: 0 }
          }
        }
      },
      include: {
        item: true,
        inventory: true
      }
    });
  }

  /**
   * Find already expired batches with stock
   */
  async getExpiredBatches(businessId: string) {
    return await prisma.batch.findMany({
      where: {
        item: { businessId },
        expiryDate: {
          lt: new Date()
        },
        inventory: {
          some: {
            availableStock: { gt: 0 }
          }
        }
      },
      include: {
        item: true,
        inventory: true
      }
    });
  }
}
