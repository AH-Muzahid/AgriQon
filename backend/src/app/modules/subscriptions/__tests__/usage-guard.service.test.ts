import { UsageGuardService } from '../usage-guard.service';
import { SubscriptionRepository } from '../subscription.repository';
import { ResourceType } from '../types/resource.types';
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

const mockGetActualUsageCounts = jest.fn();
const mockFindSubscriptionByBusinessId = jest.fn();

function createGuard() {
  const mockRepo = {
    getActualUsageCounts: mockGetActualUsageCounts,
    findSubscriptionByBusinessId: mockFindSubscriptionByBusinessId,
  } as unknown as SubscriptionRepository;
  return new UsageGuardService(mockRepo);
}

function makeSubscription(code: string, maxUsers = 3, maxProducts = 100, maxWarehouses = 1) {
  return {
    id: 'sub-123',
    businessId: 'biz-1',
    planId: 'plan-1',
    status: 'ACTIVE',
    startsAt: new Date(),
    expiresAt: new Date(Date.now() + 86400000),
    plan: {
      id: 'plan-1',
      code,
      name: code + ' Plan',
      maxUsers,
      maxProducts,
      maxWarehouses,
    },
  };
}

describe('UsageGuardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUsageLimit', () => {
    it('should throw SUBSCRIPTION_REQUIRED if no subscription exists', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(null);
      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.USERS)
      ).rejects.toThrow(new AppError('SUBSCRIPTION_REQUIRED', 403));
    });

    it('should allow USERS limit if usage is under maxUsers', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL', 3));
      mockGetActualUsageCounts.mockResolvedValue({ users: 2, products: 10, warehouses: 0 });
      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.USERS)
      ).resolves.toBeUndefined();
    });

    it('should throw USAGE_LIMIT_EXCEEDED with metadata if users usage reaches maxUsers', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL', 3));
      mockGetActualUsageCounts.mockResolvedValue({ users: 3, products: 10, warehouses: 0 });
      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.USERS)
      ).rejects.toThrow(AppError);

      try {
        await guard.validateUsageLimit('biz-1', ResourceType.USERS);
      } catch (err: any) {
        expect(err.message).toBe('USAGE_LIMIT_EXCEEDED');
        expect(err.statusCode).toBe(403);
        expect(err.resource).toBe(ResourceType.USERS);
        expect(err.current).toBe(3);
        expect(err.limit).toBe(3);
      }
    });

    it('should allow PRODUCTS limit if usage is under maxProducts', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL', 3, 100));
      mockGetActualUsageCounts.mockResolvedValue({ users: 2, products: 99, warehouses: 0 });
      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.PRODUCTS)
      ).resolves.toBeUndefined();
    });

    it('should throw USAGE_LIMIT_EXCEEDED with metadata if products usage reaches maxProducts', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL', 3, 100));
      mockGetActualUsageCounts.mockResolvedValue({ users: 2, products: 100, warehouses: 0 });
      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.PRODUCTS)
      ).rejects.toThrow(AppError);

      try {
        await guard.validateUsageLimit('biz-1', ResourceType.PRODUCTS);
      } catch (err: any) {
        expect(err.message).toBe('USAGE_LIMIT_EXCEEDED');
        expect(err.statusCode).toBe(403);
        expect(err.resource).toBe(ResourceType.PRODUCTS);
        expect(err.current).toBe(100);
        expect(err.limit).toBe(100);
      }
    });

    it('should allow WAREHOUSES limit if usage is under maxWarehouses', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL', 3, 100, 1));
      mockGetActualUsageCounts.mockResolvedValue({ users: 2, products: 10, warehouses: 0 });
      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.WAREHOUSES)
      ).resolves.toBeUndefined();
    });

    it('should throw USAGE_LIMIT_EXCEEDED with metadata if warehouses usage reaches maxWarehouses', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL', 3, 100, 1));
      mockGetActualUsageCounts.mockResolvedValue({ users: 2, products: 10, warehouses: 1 });
      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.WAREHOUSES)
      ).rejects.toThrow(AppError);

      try {
        await guard.validateUsageLimit('biz-1', ResourceType.WAREHOUSES);
      } catch (err: any) {
        expect(err.message).toBe('USAGE_LIMIT_EXCEEDED');
        expect(err.statusCode).toBe(403);
        expect(err.resource).toBe(ResourceType.WAREHOUSES);
        expect(err.current).toBe(1);
        expect(err.limit).toBe(1);
      }
    });

    it('should log USAGE_LIMIT_EXCEEDED audit event', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL', 3));
      mockGetActualUsageCounts.mockResolvedValue({ users: 3, products: 10, warehouses: 0 });
      
      const { AuditService } = jest.requireMock('../../audit/audit.service');
      const mockLog = jest.fn().mockResolvedValue({});
      AuditService.mockImplementationOnce(() => ({ log: mockLog }));

      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.USERS, 'user-123')
      ).rejects.toThrow('USAGE_LIMIT_EXCEEDED');

      expect(mockLog).toHaveBeenCalledWith({
        businessId: 'biz-1',
        action: 'USAGE_LIMIT_EXCEEDED',
        entityType: 'Subscription',
        entityId: 'sub-123',
        userId: 'user-123',
        newData: {
          businessId: 'biz-1',
          resourceType: ResourceType.USERS,
          current: 3,
          limit: 3,
          subscriptionPlan: 'TRIAL',
        },
      });
    });

    it('should be resilient and throw USAGE_LIMIT_EXCEEDED even if audit logging fails', async () => {
      mockFindSubscriptionByBusinessId.mockResolvedValue(makeSubscription('TRIAL', 3));
      mockGetActualUsageCounts.mockResolvedValue({ users: 3, products: 10, warehouses: 0 });

      const { AuditService } = jest.requireMock('../../audit/audit.service');
      AuditService.mockImplementationOnce(() => ({
        log: jest.fn().mockRejectedValue(new Error('Audit DB offline')),
      }));

      const guard = createGuard();

      await expect(
        guard.validateUsageLimit('biz-1', ResourceType.USERS, 'user-123')
      ).rejects.toThrow('USAGE_LIMIT_EXCEEDED');
    });
  });
});
