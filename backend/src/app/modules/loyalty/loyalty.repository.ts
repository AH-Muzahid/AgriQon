import { PrismaClient } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class LoyaltyRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma as any;
  }

  async createProgram(data: any) {
    return this.prisma.loyaltyProgram.create({
      data,
    });
  }

  async findProgramByBusiness(businessId: string) {
    return this.prisma.loyaltyProgram.findUnique({
      where: { businessId },
    });
  }

  async addPoints(data: any) {
    return this.prisma.loyaltyPoint.create({
      data,
    });
  }

  async getCustomerPoints(customerId: string, businessId: string) {
    const points = await this.prisma.loyaltyPoint.aggregate({
      where: {
        customerId,
        businessId,
        expiresAt: {
          gt: new Date(),
        },
      },
      _sum: {
        points: true,
      },
    });
    return points._sum.points || 0;
  }

  async getPointHistory(customerId: string, businessId: string) {
    return this.prisma.loyaltyPoint.findMany({
      where: { customerId, businessId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
