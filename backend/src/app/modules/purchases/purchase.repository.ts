import { PrismaClient, PurchaseStatus } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class PurchaseRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma as any;
  }

  async create(data: any) {
    return this.prisma.purchaseOrder.create({
      data: {
        businessId: data.businessId,
        supplierId: data.supplierId,
        status: data.status || PurchaseStatus.PENDING,
        total: data.total,
        items: {
          create: data.items.map((item: any) => ({
            businessId: data.businessId,
            itemId: item.itemId,
            quantity: item.quantity,
            unitCost: item.unitCost,
          })),
        },
      },
      include: {
        items: true,
        supplier: true,
      },
    });
  }

  async findMany(businessId: string, filter: any = {}) {
    return this.prisma.purchaseOrder.findMany({
      where: {
        businessId,
        ...filter,
      },
      include: {
        supplier: true,
        _count: {
            select: { items: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string, businessId: string) {
    return this.prisma.purchaseOrder.findUnique({
      where: {
        id,
        businessId,
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
        supplier: true,
      },
    });
  }

  async updateStatus(id: string, businessId: string, status: PurchaseStatus) {
    return this.prisma.purchaseOrder.update({
      where: {
        id,
        businessId,
      },
      data: {
        status,
      },
    });
  }
}
