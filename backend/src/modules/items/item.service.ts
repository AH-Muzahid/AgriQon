import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { withRLS } from '../../lib/prisma.utils';

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
  async list(filters: ItemFilters, userId?: string, businessId?: string) {
    return await withRLS({ userId, businessId }, async (tx) => {
      let items: any[] = [];
      let total = 0;

    if (filters.search) {
      const searchTerms = filters.search.trim().split(/\s+/).join(' & ');
      const whereClause = filters.category 
        ? Prisma.sql`AND "categoryId" = ${filters.category}` 
        : Prisma.empty;

      const [rawItems, countResult] = await Promise.all([
        tx.$queryRaw<any[]>`
          SELECT id FROM "Item"
          WHERE "searchVector" @@ to_tsquery('english', ${searchTerms})
          ${whereClause}
          ORDER BY ts_rank("searchVector", to_tsquery('english', ${searchTerms})) DESC
          LIMIT ${filters.limit} OFFSET ${(filters.page - 1) * filters.limit}
        `,
        tx.$queryRaw<any[]>`
          SELECT count(*)::int as count FROM "Item"
          WHERE "searchVector" @@ to_tsquery('english', ${searchTerms})
          ${whereClause}
        `
      ]);

      const ids = rawItems.map(item => item.id);
      total = countResult[0]?.count || 0;

      if (ids.length > 0) {
        items = await tx.item.findMany({
          where: { id: { in: ids } },
          include: itemInclude,
        });
        // Restore rank order
        const idOrder = new Map(ids.map((id, index) => [id, index]));
        items.sort((a, b) => idOrder.get(a.id)! - idOrder.get(b.id)!);
      }
    } else {
      const where: Prisma.ItemWhereInput = {
        ...(filters.category ? { categoryId: filters.category } : {}),
        ...(filters.minPrice || filters.maxPrice
          ? {
              price: {
                ...(filters.minPrice ? { gte: filters.minPrice } : {}),
                ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
              },
            }
          : {}),
      };

      const [data, count] = await Promise.all([
        tx.item.findMany({
          where,
          include: itemInclude,
          orderBy: { createdAt: 'desc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit,
        }),
        tx.item.count({ where }),
      ]);
      items = data;
      total = count;
    }

      return {
        data: items,
        meta: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      };
    });
  },

  findById(id: string, userId?: string, businessId?: string) {
    return withRLS({ userId, businessId }, (tx) => 
      tx.item.findUnique({ where: { id }, include: itemInclude })
    );
  },

  create(userId: string, businessId: string, data: any) {
    return withRLS({ userId, businessId }, (tx) => {
      const { category, stock, stockThreshold, price, ...rest } = data;
      return tx.item.create({ 
        data: { 
          ...rest, 
          price: new Prisma.Decimal(price),
          businessId,
          categoryId: category,
          inventories: {
            create: {
              businessId,
              warehouseId: 'default', // Placeholder or from data
              totalStock: new Prisma.Decimal(stock || 0),
              availableStock: new Prisma.Decimal(stock || 0),
            }
          }
        }, 
        include: itemInclude 
      });
    });
  },

  async update(id: string, userId: string, businessId: string, isAdmin: boolean, data: any) {
    return await withRLS({ userId, businessId }, async (tx) => {
      const item = await tx.item.findUnique({ where: { id } });

      if (!item) return { status: 'not-found' as const };
      if (!isAdmin && item.businessId !== businessId) return { status: 'forbidden' as const };

      const { category, price, ...rest } = data;
      return {
        status: 'ok' as const,
        item: await tx.item.update({ 
          where: { id }, 
          data: { 
            ...rest, 
            price: price ? new Prisma.Decimal(price) : undefined,
            categoryId: category 
          }, 
          include: itemInclude 
        }),
      };
    });
  },

  async remove(id: string, userId: string, businessId: string, isAdmin: boolean) {
    return await withRLS({ userId, businessId }, async (tx) => {
      const item = await tx.item.findUnique({ where: { id } });

      if (!item) return 'not-found' as const;
      if (!isAdmin && item.businessId !== businessId) return 'forbidden' as const;

      await tx.item.delete({ where: { id } });
      return 'ok' as const;
    });
  },
};
