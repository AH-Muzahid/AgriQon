import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class CustomerRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as PrismaClient) || prisma;
  }

  async findAll(params: {
    businessId: string;
    search?: string;
    skip: number;
    take: number;
  }) {
    const { businessId, search, skip, take } = params;

    const where: Prisma.CustomerWhereInput = {
      businessId,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.customer.count({ where }),
    ]);

    return { items, total };
  }

  async findById(id: string, businessId: string) {
    return await this.prisma.customer.findFirst({
      where: { id, businessId, deletedAt: null },
    });
  }

  async create(data: Prisma.CustomerUncheckedCreateInput) {
    return await this.prisma.customer.create({ data });
  }

  async update(id: string, businessId: string, data: Prisma.CustomerUpdateInput) {
    return await this.prisma.customer.update({
      where: { id, businessId },
      data,
    });
  }

  async softDelete(id: string, businessId: string) {
    return await this.prisma.customer.update({
      where: { id, businessId },
      data: { deletedAt: new Date() },
    });
  }
}
