import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class WarehouseRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as PrismaClient) || prisma;
  }

  async create(data: Prisma.WarehouseUncheckedCreateInput) {
    return await this.prisma.warehouse.create({
      data,
    });
  }

  async findMany(businessId: string) {
    return await this.prisma.warehouse.findMany({
      where: { businessId },
    });
  }

  async findById(id: string, businessId: string) {
    return await this.prisma.warehouse.findUnique({
      where: { id, businessId },
    });
  }

  async update(id: string, businessId: string, data: Prisma.WarehouseUpdateInput) {
    return await this.prisma.warehouse.update({
      where: { id, businessId },
      data,
    });
  }
}
