import { PrismaClient } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class SupplierRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma as any;
  }

  async create(data: any) {
    return this.prisma.supplier.create({
      data,
    });
  }

  async findMany(businessId: string, filter: any = {}) {
    return this.prisma.supplier.findMany({
      where: {
        businessId,
        ...filter,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string, businessId: string) {
    return this.prisma.supplier.findUnique({
      where: {
        id,
        businessId,
      },
    });
  }

  async update(id: string, businessId: string, data: any) {
    return this.prisma.supplier.update({
      where: {
        id,
        businessId,
      },
      data,
    });
  }

  async delete(id: string, businessId: string) {
    return this.prisma.supplier.delete({
      where: {
        id,
        businessId,
      },
    });
  }
}
