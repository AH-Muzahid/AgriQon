import { SubscriptionRepository } from './subscription.repository';
import { FeatureCode } from './types/feature.types';
import { AppError } from '../../errors/AppError';
import { AuditService } from '../audit/audit.service';

export class FeatureGuardService {
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
   * Validate that a business has access to a specific feature.
   * Throws AppError(403, 'FEATURE_NOT_AVAILABLE') on denial.
   * Logs FEATURE_ACCESS_DENIED audit event on denial.
   */
  async validateFeatureAccess(
    businessId: string,
    featureCode: FeatureCode,
    actorId?: string,
  ): Promise<void> {
    const hasFeature = await this.subscriptionRepository.businessHasFeature(businessId, featureCode);

    if (!hasFeature) {
      let planCode = 'UNKNOWN';
      let subscriptionId = businessId; // fallback
      
      try {
        const subscription = await this.subscriptionRepository.findSubscriptionByBusinessId(businessId);
        if (subscription) {
          planCode = subscription.plan.code;
          subscriptionId = subscription.id;
        }
      } catch (err) {
        // Swallowed to prevent blockages
      }

      try {
        await this.auditService.log({
          businessId,
          action: 'FEATURE_ACCESS_DENIED',
          entityType: 'Subscription',
          entityId: subscriptionId,
          userId: actorId,
          newData: {
            businessId,
            featureCode,
            actorId,
            subscriptionPlan: planCode,
          },
        });
      } catch (auditError) {
        // Swallowed: audit failures must never block request execution
      }

      throw new AppError('FEATURE_NOT_AVAILABLE', 403);
    }
  }
}
