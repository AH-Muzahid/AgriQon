import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';

type ItemFilters = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
};

type ItemInput = {
  title: string;
  description?: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  imageUrl?: string;
};

const itemInclude = {
  seller: { select: { id: true, name: true, email: true } },
  reviews: { select: { rating: true } },
};

export const itemService = {
  async list(filters: ItemFilters) {
    const where: Prisma.ItemWhereInput = {
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
              { category: { contains: filters.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(filters.minPrice || filters.maxPrice
        ? {
            price: {
              ...(filters.minPrice ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.item.findMany({
        where,
        include: itemInclude,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.item.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  findById(id: string) {
    return prisma.item.findUnique({ where: { id }, include: itemInclude });
  },

  create(sellerId: string, data: ItemInput) {
    return prisma.item.create({ data: { ...data, sellerId }, include: itemInclude });
  },

  async update(id: string, userId: string, isAdmin: boolean, data: Partial<ItemInput>) {
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) return { status: 'not-found' as const };
    if (!isAdmin && item.sellerId !== userId) return { status: 'forbidden' as const };

    return {
      status: 'ok' as const,
      item: await prisma.item.update({ where: { id }, data, include: itemInclude }),
    };
  },

  async remove(id: string, userId: string, isAdmin: boolean) {
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) return 'not-found' as const;
    if (!isAdmin && item.sellerId !== userId) return 'forbidden' as const;

    await prisma.item.delete({ where: { id } });
    return 'ok' as const;
  },
};
