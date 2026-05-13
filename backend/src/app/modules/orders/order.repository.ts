import { Prisma, PrismaClient, OrderStatus, PaymentStatus } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class OrderRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as PrismaClient) || prisma;
  }

  async findAll(params: {
    businessId: string;
    status?: OrderStatus;
    customerId?: string;
    skip: number;
    take: number;
  }) {
    const { businessId, status, customerId, skip, take } = params;

    const where: Prisma.OrderWhereInput = {
      businessId,
      deletedAt: null,
      ...(status && { status }),
      ...(customerId && { customerId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: { include: { item: true } },
          payments: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string, businessId: string) {
    return await this.prisma.order.findFirst({
      where: { id, businessId, deletedAt: null },
      include: {
        customer: true,
        items: { include: { item: true } },
        payments: true,
        invoice: true,
        reservations: true,
      },
    });
  }

  async create(data: Prisma.OrderUncheckedCreateInput) {
    return await this.prisma.order.create({
      data,
      include: { items: true },
    });
  }

  async updateStatus(id: string, businessId: string, status: OrderStatus) {
    return await this.prisma.order.update({
      where: { id, businessId },
      data: { status },
    });
  }

  async updatePaymentStatus(id: string, businessId: string, paymentStatus: PaymentStatus) {
    return await this.prisma.order.update({
      where: { id, businessId },
      data: { paymentStatus },
    });
  }

  async softDelete(id: string, businessId: string) {
    return await this.prisma.order.update({
      where: { id, businessId },
      data: { deletedAt: new Date() },
    });
  }

  // For reservation cleanup & locking
  async findWithLock(id: string, businessId: string, tx: Prisma.TransactionClient) {
    return await tx.order.findFirst({
      where: { id, businessId, deletedAt: null },
    });
  }
}
