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
  business: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  reviews: { select: { rating: true } },
};

export const itemService = {
  async list(filters: ItemFilters) {
    const where: Prisma.ItemWhereInput = {
      ...(filters.category ? { categoryId: filters.category } : {}),
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
              { category: { name: { contains: filters.search, mode: 'insensitive' } } },
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

  create(businessId: string, data: any) {
    const { category, stock, stockThreshold, ...rest } = data;
    return prisma.item.create({ 
      data: { 
        ...rest, 
        businessId,
        categoryId: category,
        inventory: {
          create: {
            businessId,
            warehouseId: 'default', // Placeholder or from data
            totalStock: stock || 0,
            availableStock: stock || 0,
          }
        }
      }, 
      include: itemInclude 
    });
  },

  async update(id: string, businessId: string, isAdmin: boolean, data: any) {
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) return { status: 'not-found' as const };
    if (!isAdmin && item.businessId !== businessId) return { status: 'forbidden' as const };

    const { category, ...rest } = data;
    return {
      status: 'ok' as const,
      item: await prisma.item.update({ 
        where: { id }, 
        data: { ...rest, categoryId: category }, 
        include: itemInclude 
      }),
    };
  },

  async remove(id: string, businessId: string, isAdmin: boolean) {
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) return 'not-found' as const;
    if (!isAdmin && item.businessId !== businessId) return 'forbidden' as const;

    await prisma.item.delete({ where: { id } });
    return 'ok' as const;
  },
};
