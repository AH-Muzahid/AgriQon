import { SubscriptionRepository } from './subscription.repository';
import { prisma } from '../../lib/prisma';
import logger from '../../lib/logger';

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
  }

  /**
   * Helper to ensure a default subscription and plan exist for a business.
   */
  private async ensureDefaultSubscription(businessId: string) {
    let subscription = await this.subscriptionRepository.findActiveSubscription(businessId);

    if (!subscription) {
      logger.info(`No subscription found for business ${businessId}. Provisioning default Trial Plan.`);

      // 1. Ensure default Plan exists
      let plan = await prisma.plan.findUnique({
        where: { name: 'Growth Trial Plan' },
      });

      if (!plan) {
        plan = await prisma.plan.create({
          data: {
            name: 'Growth Trial Plan',
            description: 'Standard plan for growing businesses',
            price: 0,
            interval: 'MONTHLY',
            features: {
              create: [
                { featureKey: 'max_users', value: '10' },
                { featureKey: 'max_warehouses', value: '3' },
                { featureKey: 'max_products', value: '500' },
              ],
            },
          },
        });
      }

      // 2. Create Subscription
      subscription = await prisma.subscription.create({
        data: {
          businessId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        },
        include: {
          plan: {
            include: {
              features: true,
            },
          },
        },
      });
    }

    return subscription;
  }

  /**
   * Get active subscription details
   */
  async getSubscription(businessId: string) {
    return await this.ensureDefaultSubscription(businessId);
  }

  /**
   * Compare actual resource counts against plan limits
   */
  async getSubscriptionUsage(businessId: string) {
    const subscription = await this.ensureDefaultSubscription(businessId);
    const actualUsage = await this.subscriptionRepository.getActualUsageCounts(businessId);

    // Map limits from plan features
    const features = subscription.plan.features;
    const getLimit = (key: string): number | null => {
      const feature = features.find((f: any) => f.featureKey === key);
      if (!feature) return null;
      if (feature.value.toLowerCase() === 'unlimited') return null;
      const num = parseInt(feature.value, 10);
      return isNaN(num) ? null : num;
    };

    const userLimit = getLimit('max_users');
    const warehouseLimit = getLimit('max_warehouses');
    const productLimit = getLimit('max_products');

    const metrics = [
      {
        name: 'Users',
        key: 'users',
        used: actualUsage.users,
        limit: userLimit,
        percentage: userLimit ? Math.round((actualUsage.users / userLimit) * 100) : 0,
      },
      {
        name: 'Warehouses',
        key: 'warehouses',
        used: actualUsage.warehouses,
        limit: warehouseLimit,
        percentage: warehouseLimit ? Math.round((actualUsage.warehouses / warehouseLimit) * 100) : 0,
      },
      {
        name: 'Products',
        key: 'products',
        used: actualUsage.products,
        limit: productLimit,
        percentage: productLimit ? Math.round((actualUsage.products / productLimit) * 100) : 0,
      },
    ];

    return {
      subscription: {
        id: subscription.id,
        planName: subscription.plan.name,
        status: subscription.status,
        endDate: subscription.endDate,
      },
      metrics,
    };
  }
}
