import { prisma } from '../../lib/prisma';

export class SubscriptionRepository {
  /**
   * Find active subscription details for a business, including plan and features
   */
  async findActiveSubscription(businessId: string) {
    return await prisma.subscription.findUnique({
      where: { businessId },
      include: {
        plan: {
          include: {
            features: true,
          },
        },
      },
    });
  }

  /**
   * Get database actual usage counts of resources
   */
  async getActualUsageCounts(businessId: string) {
    const [usersCount, warehousesCount, productsCount] = await Promise.all([
      prisma.userBusinessRole.count({
        where: { businessId },
      }),
      prisma.warehouse.count({
        where: { businessId },
      }),
      prisma.item.count({
        where: { businessId, deletedAt: null },
      }),
    ]);

    return {
      users: usersCount,
      warehouses: warehousesCount,
      products: productsCount,
    };
  }

  /**
   * Find usage metrics logged in UsageMetric table
   */
  async findUsageMetrics(businessId: string) {
    return await prisma.usageMetric.findMany({
      where: { businessId },
    });
  }
}
