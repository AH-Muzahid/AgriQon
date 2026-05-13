import { Prisma, Review } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class ReviewRepository {
  private prisma: Prisma.TransactionClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = tx || prisma;
  }

  async create(data: Prisma.ReviewUncheckedCreateInput): Promise<Review> {
    return this.prisma.review.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string, businessId: string): Promise<Review | null> {
    return this.prisma.review.findFirst({
      where: { id, businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByItem(itemId: string, businessId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { itemId, businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(businessId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { businessId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        item: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, businessId: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return this.prisma.review.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, businessId: string): Promise<Review> {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  async findByUserAndItem(userId: string, itemId: string, businessId: string): Promise<Review | null> {
    return this.prisma.review.findFirst({
      where: { userId, itemId, businessId },
    });
  }
}
