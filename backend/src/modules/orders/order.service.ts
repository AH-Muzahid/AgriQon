import { OrderStatus, Role } from '@prisma/client';
import { prisma } from '../../lib/prisma';

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
    const ids = items.map((item) => item.itemId);
    const products = await prisma.item.findMany({ where: { id: { in: ids } } });

    // If businessId is not provided (e.g. customer), infer from products
    const actualBusinessId = businessId || products[0]?.businessId;
    if (!actualBusinessId) throw new Error("Business ID is required to create an order");

    const productById = new Map(products.map((product) => [product.id, product]));

    const missing = ids.find((id) => !productById.has(id));
    if (missing) return { status: 'missing-item' as const, itemId: missing };

    const total = items.reduce((sum, line) => {
      const product = productById.get(line.itemId)!;
      return sum + Number(product.price) * line.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        businessId: actualBusinessId,
        total,
        items: {
          create: items.map((line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: productById.get(line.itemId)!.price,
          })),
        },
      },
      include: orderInclude,
    });

    return { status: 'ok' as const, order };
  },

  list(userId: string, role: Role) {
    return prisma.order.findMany({
      where: role === Role.ADMIN ? {} : { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
  },
};
