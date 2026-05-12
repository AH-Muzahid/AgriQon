import { MovementType, Prisma } from '@prisma/client';
import { InventoryRepository } from './inventory.repository';
import { AppError } from '../../errors/AppError';

export class InventoryService {
  constructor(private inventoryRepo: InventoryRepository) {}

  async getInventory(params: { businessId: string; itemId?: string; warehouseId?: string }) {
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
    reason?: string;
    reference?: string;
    tx?: Prisma.TransactionClient;
  }) {
    const { businessId, itemId, warehouseId, quantity, type, tx } = params;
    const repo = tx ? new InventoryRepository(tx) : this.inventoryRepo;

    // 1. Get current inventory
    let inventory = await repo.findByProductAndWarehouse({
      businessId,
      itemId,
      warehouseId,
    });

    // 2. If doesn't exist, create it (Lazy Initialization)
    if (!inventory) {
      inventory = await repo.create({
        businessId,
        itemId,
        warehouseId,
        availableStock: 0,
        totalStock: 0,
      });
    }

    // 3. Create StockMovement (Audit Trail)
    await repo.createMovement({
      businessId,
      inventoryId: inventory.id,
      type,
      quantity,
      reason: params.reason,
      reference: params.reference,
    });

    // 4. Calculate new stock
    const newStock = inventory.availableStock + quantity;

    if (newStock < 0) {
      throw new AppError('Insufficient stock for this operation', 400);
    }

    // 5. Commit with Optimistic Locking (Rule 11)
    try {
      return await repo.updateWithOptimisticLock({
        id: inventory.id,
        businessId,
        availableStock: newStock,
        version: inventory.version,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409);
      }
      throw error;
    }
  }
}
