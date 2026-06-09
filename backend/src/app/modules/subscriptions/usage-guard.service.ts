import { SubscriptionRepository } from './subscription.repository';
import { ResourceType } from './types/resource.types';
import { AppError } from '../../errors/AppError';
import { AuditService } from '../audit/audit.service';

export class UsageGuardService {
  private subscriptionRepository: SubscriptionRepository;
  private auditService: AuditService;

  constructor(
    subscriptionRepository?: SubscriptionRepository,
    auditService?: AuditService,
  ) {
    this.subscriptionRepository = subscriptionRepository || new SubscriptionRepository();
    this.auditService = auditService || new AuditService();
  }

  /**
   * Validate if a business is allowed to create or invite another resource.
   * Throws AppError(403, 'USAGE_LIMIT_EXCEEDED') with details on breach.
   * Logs USAGE_LIMIT_EXCEEDED audit event on breach.
   */
  async validateUsageLimit(
    businessId: string,
    resourceType: ResourceType,
    actorId?: string,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findSubscriptionByBusinessId(businessId);
    if (!subscription) {
      throw new AppError('SUBSCRIPTION_REQUIRED', 403);
    }

    const plan = subscription.plan;
    let limit = 0;
    let current = 0;

    const usage = await this.subscriptionRepository.getActualUsageCounts(businessId);

    if (resourceType === ResourceType.USERS) {
      limit = plan.maxUsers ?? 0;
      current = usage.users;
    } else if (resourceType === ResourceType.PRODUCTS) {
      limit = plan.maxProducts ?? 0;
      current = usage.products;
    } else if (resourceType === ResourceType.WAREHOUSES) {
      limit = plan.maxWarehouses ?? 0;
      current = usage.warehouses;
    }

    if (current >= limit) {
      try {
        await this.auditService.log({
          businessId,
          action: 'USAGE_LIMIT_EXCEEDED',
          entityType: 'Subscription',
          entityId: subscription.id,
          userId: actorId,
          newData: {
            businessId,
            resourceType,
            current,
            limit,
            subscriptionPlan: plan.code,
          },
        });
      } catch (err) {
        // Swallowed to prevent blockages
      }

      throw new AppError('USAGE_LIMIT_EXCEEDED', 403, resourceType, current, limit);
    }
  }
}
