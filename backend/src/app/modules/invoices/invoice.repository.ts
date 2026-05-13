import { Prisma, PrismaClient } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class InvoiceRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as PrismaClient) || prisma;
  }

  async findAll(params: {
    businessId: string;
    customerId?: string;
    skip: number;
    take: number;
  }) {
    const { businessId, customerId, skip, take } = params;

    const where: Prisma.InvoiceWhereInput = {
      businessId,
      deletedAt: null,
      ...(customerId && { customerId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { customer: true, order: true },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string, businessId: string) {
    return await this.prisma.invoice.findFirst({
      where: { id, businessId, deletedAt: null },
      include: {
        customer: true,
        order: { include: { items: { include: { item: true } } } },
      },
    });
  }

  async findByOrderId(orderId: string, businessId: string) {
    return await this.prisma.invoice.findFirst({
      where: { orderId, businessId, deletedAt: null },
    });
  }

  async update(id: string, businessId: string, data: Prisma.InvoiceUpdateInput) {
    return await this.prisma.invoice.update({
      where: { id, businessId },
      data,
    });
  }

  async softDelete(id: string, businessId: string) {
    return await this.prisma.invoice.update({
      where: { id, businessId },
      data: { deletedAt: new Date() },
    });
  }
}
