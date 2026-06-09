import { Prisma, PrismaClient } from '../../../generated/client';
import { prisma } from '../../lib/prisma';
import { FeatureCode } from './types/feature.types';

export class SubscriptionRepository {
  private prisma: PrismaClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = (tx as PrismaClient) || prisma;
  }

  /**
   * Check if a business subscription has access to a specific feature key.
   */
  async businessHasFeature(businessId: string, featureCode: FeatureCode): Promise<boolean> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { businessId },
      include: {
        plan: {
          include: {
            features: {
              where: {
                featureKey: featureCode,
                value: 'true',
              },
            },
          },
        },
      },
    });

    if (!subscription || !subscription.plan?.features) {
      return false;
    }

    // Fallback in-memory filter to support mock objects in unit/integration tests
    const activeFeatures = subscription.plan.features.filter(
      (f) => f.featureKey === featureCode && f.value === 'true'
    );

    return activeFeatures.length > 0;
  }

  /**
   * Find a business subscription regardless of status.
   * Used by SubscriptionGuardService for status-based enforcement.
   */
  async findSubscriptionByBusinessId(businessId: string) {
    return await this.prisma.subscription.findUnique({
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
   * Find active subscription details for a business, including plan and features
   */
  async findActiveSubscription(businessId: string) {
    return await this.prisma.subscription.findUnique({
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
   * Find a subscription plan by its code
   */
  async findPlanByCode(code: string) {
    return await this.prisma.subscriptionPlan.findUnique({
      where: { code },
    });
  }

  async create(data: Prisma.SubscriptionUncheckedCreateInput) {
    return await this.prisma.subscription.create({
      data,
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
      this.prisma.userBusinessRole.count({
        where: { businessId },
      }),
      this.prisma.warehouse.count({
        where: { businessId },
      }),
      this.prisma.item.count({
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
    return await this.prisma.usageMetric.findMany({
      where: { businessId },
    });
  }
}
