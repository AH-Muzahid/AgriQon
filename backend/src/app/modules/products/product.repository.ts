import { Prisma, PrismaClient } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class ProductRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as PrismaClient) || prisma;
  }

  async create(data: Prisma.ItemUncheckedCreateInput) {
    return await this.prisma.item.create({
      data,
    });
  }

  async findById(id: string, businessId: string) {
    return await this.prisma.item.findUnique({
      where: {
        id,
        businessId, // Rule 7: Scoped by businessId
      },
    });
  }

  async update(id: string, businessId: string, data: Prisma.ItemUpdateInput) {
    return await this.prisma.item.update({
      where: {
        id,
        businessId, // Rule 7
      },
      data,
    });
  }

  async delete(id: string, businessId: string) {
    return await this.prisma.item.update({
      where: {
        id,
        businessId, // Rule 7
      },
      data: {
        deletedAt: new Date(), // Rule 14: Soft Delete
      },
    });
  }

  async findAll(params: {
    businessId: string;
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    skip: number;
    take: number;
  }) {
    const { businessId, search, categoryId, minPrice, maxPrice, skip, take } = params;

    const where: Prisma.ItemWhereInput = {
      businessId, // Rule 7
      deletedAt: null, // Rule 14
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      },
    };

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.item.count({ where }),
    ]);

    return { items, total };
  }
}
