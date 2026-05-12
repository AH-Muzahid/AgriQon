import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class InventoryRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as PrismaClient) || prisma;
  }

  async findByProductAndWarehouse(params: {
    businessId: string;
    itemId: string;
    warehouseId: string;
    batchId?: string;
  }) {
    return await this.prisma.inventory.findUnique({
      where: {
        warehouseId_itemId_batchId: {
          warehouseId: params.warehouseId,
          itemId: params.itemId,
          batchId: params.batchId || null as any,
        },
      },
    });
  }

  async findMany(params: { businessId: string; itemId?: string; warehouseId?: string }) {
    return await this.prisma.inventory.findMany({
      where: {
        businessId: params.businessId,
        itemId: params.itemId,
        warehouseId: params.warehouseId,
      },
      include: {
        item: true,
        warehouse: true,
        batch: true,
      },
    });
  }

  async create(data: Prisma.InventoryUncheckedCreateInput) {
    return await this.prisma.inventory.create({
      data,
    });
  }

  async updateWithOptimisticLock(params: {
    id: string;
    businessId: string;
    availableStock: number;
    version: number;
  }) {
    // Rule 11: Optimistic Locking
    return await this.prisma.inventory.update({
      where: {
        id: params.id,
        businessId: params.businessId,
        version: params.version, // MUST match current version
      },
      data: {
        availableStock: params.availableStock,
        version: { increment: 1 }, // Auto-increment version
      },
    });
  }

  async createMovement(data: Prisma.StockMovementUncheckedCreateInput) {
    return await this.prisma.stockMovement.create({
      data,
    });
  }
}
