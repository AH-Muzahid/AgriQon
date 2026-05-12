import { prisma } from '../../lib/prisma';
import { withRLS } from '../../lib/prisma.utils';

type ReviewInput = {
  itemId: string;
  rating: number;
  comment?: string;
};

export const reviewService = {
  async create(userId: string, businessId: string | undefined, data: ReviewInput) {
    return withRLS({ userId, businessId }, async (tx) => {
      let actualBusinessId = businessId;
      if (!actualBusinessId) {
        const item = await tx.item.findUnique({ where: { id: data.itemId }, select: { businessId: true } });
        if (!item) throw new Error("Item not found");
        actualBusinessId = item.businessId;
      }

      return tx.review.upsert({
        where: { userId_itemId: { userId, itemId: data.itemId } },
        update: { rating: data.rating, comment: data.comment },
        create: { ...data, userId, businessId: actualBusinessId },
        include: { user: { select: { id: true, name: true } } },
      });
    });
  },

  listForItem(itemId: string, userId?: string, businessId?: string) {
    return withRLS({ userId, businessId }, (tx) =>
      tx.review.findMany({
        where: { itemId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      })
    );
  },
};
