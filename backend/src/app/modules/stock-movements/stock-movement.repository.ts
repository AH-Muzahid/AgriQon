import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class StockMovementRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as PrismaClient) || prisma;
  }

  async findMany(params: {
    businessId: string;
    inventoryId?: string;
    itemId?: string;
    warehouseId?: string;
    limit?: number;
    skip?: number;
  }) {
    const { businessId, inventoryId, itemId, warehouseId, limit = 50, skip = 0 } = params;

    return await this.prisma.stockMovement.findMany({
      where: {
        businessId,
        inventoryId,
        inventory: {
          itemId,
          warehouseId,
        },
      },
      include: {
        inventory: {
          include: {
            item: true,
            warehouse: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
    });
  }
}
