import { ReadOnlyGuardService } from '../read-only-guard.service';
import { SubscriptionRepository } from '../subscription.repository';
import { AppError } from '../../../errors/AppError';
import { SubscriptionStatus } from '../../../../generated/client';

const mockFindSubscriptionByBusinessId = jest.fn();

function createGuard() {
  const mockRepo = {
    findSubscriptionByBusinessId: mockFindSubscriptionByBusinessId,
  } as unknown as SubscriptionRepository;
  return new ReadOnlyGuardService(mockRepo);
}

function makeSubscription(status: SubscriptionStatus) {
  return {
    id: 'sub-123',
    businessId: 'biz-1',
    planId: 'plan-1',
    status,
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
  };
}

describe('ReadOnlyGuardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateBusinessWritable', () => {
    it('should allow writable if no subscription exists (onboarding bypass)', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(null);
      const guard = createGuard();

      await expect(
        guard.validateBusinessWritable('biz-1')
      ).resolves.toBeUndefined();
    });

    it('should allow TRIAL status', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription(SubscriptionStatus.TRIAL));
      const guard = createGuard();

      await expect(
        guard.validateBusinessWritable('biz-1')
      ).resolves.toBeUndefined();
    });

    it('should allow ACTIVE status', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription(SubscriptionStatus.ACTIVE));
      const guard = createGuard();

      await expect(
        guard.validateBusinessWritable('biz-1')
      ).resolves.toBeUndefined();
    });

    it('should throw BUSINESS_READ_ONLY if status is GRACE_PERIOD', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription(SubscriptionStatus.GRACE_PERIOD));
      const guard = createGuard();

      await expect(
        guard.validateBusinessWritable('biz-1')
      ).rejects.toThrow(AppError);

      try {
        await guard.validateBusinessWritable('biz-1');
      } catch (err: any) {
        expect(err.message).toBe('BUSINESS_READ_ONLY');
        expect(err.statusCode).toBe(403);
        expect(err.code).toBe('BUSINESS_READ_ONLY');
        expect(err.subscriptionStatus).toBe(SubscriptionStatus.GRACE_PERIOD);
      }
    });

    it('should throw BUSINESS_READ_ONLY if status is SUSPENDED', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription(SubscriptionStatus.SUSPENDED));
      const guard = createGuard();

      await expect(
        guard.validateBusinessWritable('biz-1')
      ).rejects.toThrow('BUSINESS_READ_ONLY');
    });

    it('should throw BUSINESS_READ_ONLY if status is CANCELLED', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription(SubscriptionStatus.CANCELLED));
      const guard = createGuard();

      await expect(
        guard.validateBusinessWritable('biz-1')
      ).rejects.toThrow('BUSINESS_READ_ONLY');
    });

    it('should throw BUSINESS_READ_ONLY if status is EXPIRED', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription(SubscriptionStatus.EXPIRED));
      const guard = createGuard();

      await expect(
        guard.validateBusinessWritable('biz-1')
      ).rejects.toThrow('BUSINESS_READ_ONLY');
    });
  });
});
