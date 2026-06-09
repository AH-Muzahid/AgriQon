import { FeatureGuardService } from '../feature-guard.service';
import { SubscriptionRepository } from '../subscription.repository';
import { FeatureCode } from '../types/feature.types';
import { AppError } from '../../../errors/AppError';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    subscription: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../audit/audit.service', () => {
  return {
    AuditService: jest.fn().mockImplementation(() => {
      return {
        log: jest.fn().mockResolvedValue({}),
      };
    }),
  };
});

const mockBusinessHasFeature = jest.fn();
const mockFindSubscriptionByBusinessId = jest.fn();

function createGuard() {
  const mockRepo = {
    businessHasFeature: mockBusinessHasFeature,
    findSubscriptionByBusinessId: mockFindSubscriptionByBusinessId,
  } as unknown as SubscriptionRepository;
  return new FeatureGuardService(mockRepo);
}

function makeSubscription(planCode: string) {
  return {
    id: 'sub-123',
    businessId: 'biz-1',
    planId: 'plan-1',
    status: 'ACTIVE',
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    plan: { id: 'plan-1', code: planCode, name: 'Subscription Plan' },
  };
}

describe('FeatureGuardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFeatureAccess', () => {
    it('should pass if businessHasFeature returns true', async () => {
      mockBusinessHasFeature.mockResolvedValue(true);
      const guard = createGuard();

      await expect(
        guard.validateFeatureAccess('biz-1', FeatureCode.ACCOUNTING)
      ).resolves.toBeUndefined();

      expect(mockBusinessHasFeature).toHaveBeenCalledWith('biz-1', FeatureCode.ACCOUNTING);
      expect(mockFindSubscriptionByBusinessId).not.toHaveBeenCalled();
    });

    it('should throw FEATURE_NOT_AVAILABLE (403) and log audit event if feature is not allowed', async () => {
      mockBusinessHasFeature.mockResolvedValue(false);
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL'));
      const guard = createGuard();

      await expect(
        guard.validateFeatureAccess('biz-1', FeatureCode.ACCOUNTING, 'user-1')
      ).rejects.toThrow(AppError);

      try {
        await guard.validateFeatureAccess('biz-1', FeatureCode.ACCOUNTING, 'user-1');
      } catch (err: any) {
        expect(err.message).toBe('FEATURE_NOT_AVAILABLE');
        expect(err.statusCode).toBe(403);
      }

      expect(mockBusinessHasFeature).toHaveBeenCalledWith('biz-1', FeatureCode.ACCOUNTING);
      expect(mockFindSubscriptionByBusinessId).toHaveBeenCalledWith('biz-1');
    });

    it('should log FEATURE_ACCESS_DENIED audit event with details', async () => {
      mockBusinessHasFeature.mockResolvedValue(false);
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL'));
      
      const { AuditService } = jest.requireMock('../../audit/audit.service');
      const mockLog = jest.fn().mockResolvedValue({});
      AuditService.mockImplementationOnce(() => ({ log: mockLog }));

      const guard = createGuard();

      await expect(
        guard.validateFeatureAccess('biz-1', FeatureCode.ACCOUNTING, 'user-1')
      ).rejects.toThrow('FEATURE_NOT_AVAILABLE');

      expect(mockLog).toHaveBeenCalledWith({
        businessId: 'biz-1',
        action: 'FEATURE_ACCESS_DENIED',
        entityType: 'Subscription',
        entityId: 'sub-123',
        userId: 'user-1',
        newData: {
          businessId: 'biz-1',
          featureCode: FeatureCode.ACCOUNTING,
          actorId: 'user-1',
          subscriptionPlan: 'TRIAL',
        },
      });
    });

    it('should be resilient and throw FEATURE_NOT_AVAILABLE even if audit logging fails', async () => {
      mockBusinessHasFeature.mockResolvedValue(false);
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL'));
      
      const { AuditService } = jest.requireMock('../../audit/audit.service');
      AuditService.mockImplementationOnce(() => ({
        log: jest.fn().mockRejectedValue(new Error('Audit DB offline')),
      }));

      const guard = createGuard();

      await expect(
        guard.validateFeatureAccess('biz-1', FeatureCode.ACCOUNTING, 'user-1')
      ).rejects.toThrow('FEATURE_NOT_AVAILABLE');
    });
  });
});
