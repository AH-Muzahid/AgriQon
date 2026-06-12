import { SubscriptionRepository } from './subscription.repository';
import { CreateTrialSubscriptionDTO } from './dto/subscription.dto';
import { AuditService } from '../audit/audit.service';
import { env } from '../../../config/env';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import logger from '../../lib/logger';
import { Prisma } from '../../../generated/client';

export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;

  constructor(subscriptionRepository?: SubscriptionRepository) {
    this.subscriptionRepository = subscriptionRepository || new SubscriptionRepository();
  }

  /**
   * Create trial subscription for a business.
   */
  async createTrialSubscription(data: CreateTrialSubscriptionDTO, tx?: Prisma.TransactionClient) {
    const { businessId } = data;
    const repo = tx ? new SubscriptionRepository(tx) : this.subscriptionRepository;

    // 1. Lookup existing subscription
    const existingSubscription = await repo.findActiveSubscription(businessId);
    if (existingSubscription) {
      logger.warn(`Subscription already exists for business ${businessId}.`);

      // Log warning event
      const auditService = new AuditService();
      await auditService.log({
        businessId,
        action: 'SUBSCRIPTION_ALREADY_EXISTS',
        entityType: 'Subscription',
        entityId: existingSubscription.id,
        newData: {
          businessId,
          subscriptionId: existingSubscription.id,
        },
        tx,
      });

      return existingSubscription;
    }

    // 2. Load TRIAL plan
    const trialPlan = await repo.findPlanByCode('TRIAL');
    if (!trialPlan) {
      throw new AppError('TRIAL subscription plan not found in database', httpStatus.NOT_FOUND);
    }

    // 3. Create trial subscription
    const trialDays = env.subscriptionTrialDays;
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + trialDays * 24 * 60 * 60 * 1000);

    const subscription = await repo.create({
      businessId,
      planId: trialPlan.id,
      status: 'TRIAL',
      startsAt,
      expiresAt,
    });

    // 4. Log audit event
    const auditService = new AuditService();
    await auditService.log({
      businessId,
      action: 'SUBSCRIPTION_TRIAL_CREATED',
      entityType: 'Subscription',
      entityId: subscription.id,
      newData: {
        businessId,
        subscriptionId: subscription.id,
        planCode: trialPlan.code,
        planName: trialPlan.name,
        expiresAt: subscription.expiresAt,
      },
      tx,
    });

    return subscription;
  }

  /**
   * Helper to ensure a default subscription and plan exist for a business.
   * Maintains backward compatibility for direct calls.
   */
  private async ensureDefaultSubscription(businessId: string) {
    let subscription = await this.subscriptionRepository.findActiveSubscription(businessId);

    if (!subscription) {
      logger.info(`No subscription found for business ${businessId}. Auto-provisioning trial subscription.`);
      try {
        subscription = await this.createTrialSubscription({ businessId });
      } catch (error) {
        logger.error(`Failed to auto-provision trial subscription for business ${businessId}:`, error);
        throw error;
      }
    }

    return subscription;
  }

  /**
   * Get active subscription details
   */
  async getSubscription(businessId: string) {
    return await this.ensureDefaultSubscription(businessId);
  }

  async getSubscriptionUsage(businessId: string) {
    const subscription = await this.ensureDefaultSubscription(businessId);
    if (!subscription) {
      throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
    }
    const actualUsage = await this.subscriptionRepository.getActualUsageCounts(businessId);

    // Map limits from plan features or direct fields
    const features = subscription.plan.features || [];
    const getLimit = (key: string): number | null => {
      const feature = features.find((f: any) => f.featureKey === key);
      if (!feature) return null;
      if (feature.value.toLowerCase() === 'unlimited') return null;
      const num = parseInt(feature.value, 10);
      return isNaN(num) ? null : num;
    };

    const userLimit = subscription.plan.maxUsers !== null ? subscription.plan.maxUsers : getLimit('max_users');
    const warehouseLimit = subscription.plan.maxWarehouses !== null ? subscription.plan.maxWarehouses : getLimit('max_warehouses');
    const productLimit = subscription.plan.maxProducts !== null ? subscription.plan.maxProducts : getLimit('max_products');

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
        percentage: warehouseLimit ? Math.round((actualUsage.warehouses / warehouseLimit) ? (actualUsage.warehouses / warehouseLimit) * 100 : 0) : 0,
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
        endDate: subscription.expiresAt, // Map expiresAt to endDate for backward compatibility
        expiresAt: subscription.expiresAt,
      },
      metrics,
    };
  }

  async getCurrentSubscription(businessId: string) {
    const subscription = await this.ensureDefaultSubscription(businessId);
    if (!subscription) {
      throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
    }

    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    const diffTime = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      plan: {
        code: subscription.plan.code,
        name: subscription.plan.name,
      },
      status: subscription.status,
      startsAt: subscription.startsAt.toISOString(),
      expiresAt: subscription.expiresAt.toISOString(),
      graceEndsAt: subscription.graceEndsAt ? subscription.graceEndsAt.toISOString() : null,
      daysRemaining,
    };
  }

  async getSubscriptionUsageLimits(businessId: string) {
    const subscription = await this.ensureDefaultSubscription(businessId);
    if (!subscription) {
      throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
    }
    const actualUsage = await this.subscriptionRepository.getActualUsageCounts(businessId);

    // Map limits from plan features or direct fields
    const features = subscription.plan.features || [];
    const getLimit = (key: string): number | null => {
      const feature = features.find((f: any) => f.featureKey === key);
      if (!feature) return null;
      if (feature.value.toLowerCase() === 'unlimited') return null;
      const num = parseInt(feature.value, 10);
      return isNaN(num) ? null : num;
    };

    const userLimit = subscription.plan.maxUsers !== null ? subscription.plan.maxUsers : getLimit('max_users');
    const warehouseLimit = subscription.plan.maxWarehouses !== null ? subscription.plan.maxWarehouses : getLimit('max_warehouses');
    const productLimit = subscription.plan.maxProducts !== null ? subscription.plan.maxProducts : getLimit('max_products');

    return {
      users: {
        current: actualUsage.users,
        limit: userLimit ?? 0,
      },
      products: {
        current: actualUsage.products,
        limit: productLimit ?? 0,
      },
      warehouses: {
        current: actualUsage.warehouses,
        limit: warehouseLimit ?? 0,
      },
    };
  }

  async getSubscriptionFeatures(businessId: string) {
    const subscription = await this.ensureDefaultSubscription(businessId);
    
    // Convert array of features to dictionary: { [featureKey]: value === 'true' }
    const featuresDict: Record<string, boolean> = {};
    
    // Seed features list to ensure all expected feature codes are present
    const allFeatureCodes = ['INVENTORY', 'POS', 'CRM', 'HRM', 'ACCOUNTING', 'AI_CHAT', 'AI_REPORTS', 'MULTI_BRANCH'];
    for (const code of allFeatureCodes) {
      featuresDict[code] = false;
    }

    if (subscription?.plan?.features) {
      for (const feature of subscription.plan.features) {
        featuresDict[feature.featureKey] = feature.value === 'true';
      }
    }

    return featuresDict;
  }
}

