import { prisma } from '../../lib/prisma';

type ReviewInput = {
  itemId: string;
  rating: number;
  comment?: string;
};

export const reviewService = {
  create(userId: string, data: ReviewInput) {
    return prisma.review.upsert({
      where: { userId_itemId: { userId, itemId: data.itemId } },
      update: { rating: data.rating, comment: data.comment },
      create: { ...data, userId },
      include: { user: { select: { id: true, name: true } } },
    });
  },

  listForItem(itemId: string) {
    return prisma.review.findMany({
      where: { itemId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },
};
