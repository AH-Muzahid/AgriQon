import { Prisma, PrismaClient } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class WarehouseTransferRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as unknown as PrismaClient) || prisma;
  }

  async create(data: {
    businessId: string;
    sourceId: string;
    destinationId: string;
    status?: string;
    items: { itemId: string; quantity: number; batchId?: string }[];
  }) {
    const { items, ...transferData } = data;
    return this.prisma.warehouseTransfer.create({
      data: {
        ...transferData,
        items: {
          create: items,
        },
      },
      include: {
        items: {
          include: { item: true }
        }
      },
    });
  }

  async findById(id: string, businessId: string) {
    return this.prisma.warehouseTransfer.findUnique({
      where: { id, businessId } as any, // findUnique usually only takes unique fields, but we can use findFirst if needed or ensure businessId is part of the query if possible. Actually findUnique on 'id' is fine, but for security we should verify businessId.
      include: {
        items: {
          include: {
            item: true
          }
        },
        source: true,
        destination: true
      },
    });
  }

  // Since 'id' is unique, findUnique doesn't support 'businessId' unless it's a composite key.
  // We should use findFirst to ensure businessId matches.
  async findSecureById(id: string, businessId: string) {
    return this.prisma.warehouseTransfer.findFirst({
      where: { id, businessId },
      include: {
        items: {
          include: {
            item: true
          }
        },
        source: true,
        destination: true
      },
    });
  }

  async updateStatus(id: string, businessId: string, status: string) {
    return this.prisma.warehouseTransfer.updateMany({
      where: { id, businessId },
      data: { status },
    });
  }

  async findMany(businessId: string) {
    return this.prisma.warehouseTransfer.findMany({
      where: { businessId },
      include: {
        items: {
          include: {
            item: true
          }
        },
        source: true,
        destination: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
