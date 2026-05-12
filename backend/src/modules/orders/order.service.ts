import { OrderStatus, Role, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { withRLS } from '../../lib/prisma.utils';

type OrderItemInput = {
  itemId: string;
  quantity: number;
};

const orderInclude = {
  user: { select: { id: true, name: true, email: true } },
  items: {
    include: {
      item: { 
        select: { 
          id: true, 
          title: true, 
          category: { select: { name: true } }, 
          businessId: true 
        } 
      },
    },
  },
};

export const orderService = {
  async create(userId: string, businessId: string | undefined | null, items: OrderItemInput[]) {
    return await withRLS({ userId }, async (tx) => {
      const ids = items.map((item) => item.itemId);
      const products = await tx.item.findMany({ where: { id: { in: ids } } });

      // If businessId is not provided (e.g. customer), infer from products
      const actualBusinessId = businessId || products[0]?.businessId;
      if (!actualBusinessId) throw new Error("Business ID is required to create an order");

      // Set business context for RLS in this transaction if we found one
      await tx.$executeRawUnsafe(`SET LOCAL app.current_business_id = '${actualBusinessId.replace(/'/g, "''")}'`);

      const productById = new Map(products.map((product) => [product.id, product]));

      const missing = ids.find((id) => !productById.has(id));
      if (missing) return { status: 'missing-item' as const, itemId: missing };

      const total = items.reduce((sum, line) => {
        const product = productById.get(line.itemId)!;
        return sum.plus(product.price.times(line.quantity));
      }, new Prisma.Decimal(0));

      const order = await tx.order.create({
        data: {
          userId,
          businessId: actualBusinessId,
          total,
          items: {
            create: items.map((line) => ({
              itemId: line.itemId,
              businessId: actualBusinessId,
              quantity: line.quantity,
              unitPrice: productById.get(line.itemId)!.price,
            })),
          },
        },
        include: orderInclude,
      });

      return { status: 'ok' as const, order };
    });
  },

  async list(userId: string, role: Role, businessId?: string) {
    return await withRLS({ userId, businessId }, async (tx) => {
      return tx.order.findMany({
        where: role === Role.ADMIN ? {} : { 
          OR: [
            { userId },
            { businessId: businessId || undefined }
          ]
        },
        include: orderInclude,
        orderBy: { createdAt: 'desc' },
      });
    });
  },

  async updateStatus(id: string, status: OrderStatus, userId: string, businessId?: string) {
    return await withRLS({ userId, businessId }, async (tx) => {
      return tx.order.update({ where: { id }, data: { status }, include: orderInclude });
    });
  },
};
