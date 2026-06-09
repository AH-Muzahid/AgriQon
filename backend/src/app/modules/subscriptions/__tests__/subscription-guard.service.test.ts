import { SubscriptionGuardService } from '../subscription-guard.service';
import { SubscriptionRepository } from '../subscription.repository';
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

const mockFindSubscriptionByBusinessId = jest.fn();

function createGuard() {
  const mockRepo = {
    findSubscriptionByBusinessId: mockFindSubscriptionByBusinessId,
  } as unknown as SubscriptionRepository;
  return new SubscriptionGuardService(mockRepo);
}

function makeSubscription(status: string) {
  return {
    id: 'sub-1',
    businessId: 'biz-1',
    status,
    planId: 'plan-1',
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    plan: { id: 'plan-1', code: 'TRIAL', name: 'Trial', isTrial: true },
  };
}

describe('SubscriptionGuardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateBusinessSubscription', () => {
    it('should throw SUBSCRIPTION_REQUIRED (403) when no subscription exists', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(null);
      const guard = createGuard();

      await expect(guard.validateBusinessSubscription('biz-1')).rejects.toThrow(AppError);

      try {
        await guard.validateBusinessSubscription('biz-1');
      } catch (err: any) {
        expect(err.message).toBe('SUBSCRIPTION_REQUIRED');
        expect(err.statusCode).toBe(403);
      }
    });

    it('should pass for TRIAL status', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL'));
      const guard = createGuard();

      await expect(guard.validateBusinessSubscription('biz-1')).resolves.toBeUndefined();
    });

    it('should pass for ACTIVE status', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('ACTIVE'));
      const guard = createGuard();

      await expect(guard.validateBusinessSubscription('biz-1')).resolves.toBeUndefined();
    });

    it('should pass for GRACE_PERIOD status', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('GRACE_PERIOD'));
      const guard = createGuard();

      await expect(guard.validateBusinessSubscription('biz-1')).resolves.toBeUndefined();
    });

    it('should throw SUBSCRIPTION_EXPIRED (403) for EXPIRED status', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('EXPIRED'));
      const guard = createGuard();

      try {
        await guard.validateBusinessSubscription('biz-1');
        fail('Expected AppError to be thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('SUBSCRIPTION_EXPIRED');
        expect(err.statusCode).toBe(403);
      }
    });

    it('should throw SUBSCRIPTION_EXPIRED (403) for SUSPENDED status', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('SUSPENDED'));
      const guard = createGuard();

      try {
        await guard.validateBusinessSubscription('biz-1');
        fail('Expected AppError to be thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('SUBSCRIPTION_EXPIRED');
        expect(err.statusCode).toBe(403);
      }
    });

    it('should throw SUBSCRIPTION_EXPIRED (403) for CANCELLED status', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('CANCELLED'));
      const guard = createGuard();

      try {
        await guard.validateBusinessSubscription('biz-1');
        fail('Expected AppError to be thrown');
      } catch (err: any) {
        expect(err).toBeInstanceOf(AppError);
        expect(err.message).toBe('SUBSCRIPTION_EXPIRED');
        expect(err.statusCode).toBe(403);
      }
    });

    it('should call findSubscriptionByBusinessId with correct businessId', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('ACTIVE'));
      const guard = createGuard();

      await guard.validateBusinessSubscription('biz-xyz');

      expect(mockFindSubscriptionByBusinessId).toHaveBeenCalledWith('biz-xyz');
      expect(mockFindSubscriptionByBusinessId).toHaveBeenCalledTimes(1);
    });

    it('should not throw when audit logging fails', async () => {
      // Simulate no subscription + broken audit
      mockFindSubscriptionByBusinessId.mockResolvedValue(null);
      const { AuditService } = jest.requireMock('../../audit/audit.service');
      AuditService.mockImplementationOnce(() => ({
        log: jest.fn().mockRejectedValue(new Error('Audit DB down')),
      }));

      const guard = createGuard();

      // Should still throw SUBSCRIPTION_REQUIRED, not an audit error
      await expect(guard.validateBusinessSubscription('biz-1')).rejects.toThrow('SUBSCRIPTION_REQUIRED');
    });
  });
});
