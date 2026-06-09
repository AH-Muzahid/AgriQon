import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionStatus } from '../../../generated/client';
import { AppError } from '../../errors/AppError';
import { AuditService } from '../audit/audit.service';

/**
 * Statuses that block resource creation.
 * TRIAL, ACTIVE, and GRACE_PERIOD are allowed.
 */
const BLOCKED_STATUSES: Set<SubscriptionStatus> = new Set([
  SubscriptionStatus.EXPIRED,
  SubscriptionStatus.SUSPENDED,
  SubscriptionStatus.CANCELLED,
]);

export class SubscriptionGuardService {
  private subscriptionRepository: SubscriptionRepository;

  constructor(subscriptionRepository?: SubscriptionRepository) {
    this.subscriptionRepository = subscriptionRepository || new SubscriptionRepository();
  }

  /**
   * Validate that a business has an active (non-blocked) subscription.
   * Throws AppError(403) if no subscription exists or status is blocked.
   * Logs SUBSCRIPTION_ACCESS_DENIED audit event on denial.
   */
  async validateBusinessSubscription(businessId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findSubscriptionByBusinessId(businessId);

    if (!subscription) {
      await this.logAccessDenied(businessId, businessId, 'SUBSCRIPTION_REQUIRED');
      throw new AppError('SUBSCRIPTION_REQUIRED', 403);
    }

    if (BLOCKED_STATUSES.has(subscription.status)) {
      await this.logAccessDenied(businessId, subscription.id, 'SUBSCRIPTION_EXPIRED', subscription.status);
      throw new AppError('SUBSCRIPTION_EXPIRED', 403);
    }

    // TRIAL, ACTIVE, GRACE_PERIOD — allowed
  }

  /**
   * Log a SUBSCRIPTION_ACCESS_DENIED audit event.
   * Audit failures are swallowed (resilient) — they never break the caller.
   */
  private async logAccessDenied(
    businessId: string,
    entityId: string,
    reason: string,
    status?: string,
  ): Promise<void> {
    try {
      const auditService = new AuditService();
      await auditService.log({
        businessId,
        action: 'SUBSCRIPTION_ACCESS_DENIED',
        entityType: 'Subscription',
        entityId,
        newData: { reason, ...(status ? { status } : {}) },
      });
    } catch {
      // Audit is best-effort — never throw from here
    }
  }
}
