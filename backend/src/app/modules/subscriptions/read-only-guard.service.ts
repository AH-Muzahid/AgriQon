import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionStatus } from '../../../generated/client';
import { AppError } from '../../errors/AppError';

export class ReadOnlyGuardService {
  constructor(private subscriptionRepository: SubscriptionRepository) {}

  async validateBusinessWritable(businessId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findSubscriptionByBusinessId(businessId);
    
    // Onboarding safe bypass (when no subscription is provisioned yet)
    if (!subscription) {
      return;
    }

    const blockedStatuses: Set<SubscriptionStatus> = new Set([
      SubscriptionStatus.GRACE_PERIOD,
      SubscriptionStatus.SUSPENDED,
      SubscriptionStatus.CANCELLED,
      SubscriptionStatus.EXPIRED,
    ]);

    if (blockedStatuses.has(subscription.status)) {
      throw new AppError(
        'BUSINESS_READ_ONLY',
        403,
        undefined,
        undefined,
        undefined,
        'BUSINESS_READ_ONLY',
        subscription.status
      );
    }
  }
}
