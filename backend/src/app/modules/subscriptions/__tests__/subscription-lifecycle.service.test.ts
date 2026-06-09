import { SubscriptionLifecycleService } from '../subscription-lifecycle.service';
import { SubscriptionRepository } from '../subscription.repository';
import { SubscriptionStatus } from '../../../../generated/client';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/prisma', () => {
  return {
    prisma: {
      subscription: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
    },
  };
});

jest.mock('../../audit/audit.service', () => {
  return {
    AuditService: jest.fn().mockImplementation(() => {
      return {
        log: jest.fn().mockResolvedValue({}),
      };
    }),
  };
});

const mockFindMany = prisma.subscription.findMany as jest.Mock;
const mockUpdate = prisma.subscription.update as jest.Mock;

describe('SubscriptionLifecycleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should transition expired TRIAL and ACTIVE subscriptions to GRACE_PERIOD, and expired GRACE_PERIOD to SUSPENDED', async () => {
    const mockTrialSub = {
      id: 'sub-trial',
      businessId: 'biz-trial',
      status: SubscriptionStatus.TRIAL,
      expiresAt: new Date(Date.now() - 1000), // expired 1s ago
    };

    const mockActiveSub = {
      id: 'sub-active',
      businessId: 'biz-active',
      status: SubscriptionStatus.ACTIVE,
      expiresAt: new Date(Date.now() - 5000), // expired 5s ago
    };

    const mockGraceSub = {
      id: 'sub-grace',
      businessId: 'biz-grace',
      status: SubscriptionStatus.GRACE_PERIOD,
      graceEndsAt: new Date(Date.now() - 10000), // grace period expired 10s ago
    };

    // First call to findMany (finding TRIAL/ACTIVE) returns [mockTrialSub, mockActiveSub]
    // Second call to findMany (finding GRACE_PERIOD) returns [mockGraceSub]
    mockFindMany
      .mockResolvedValueOnce([mockTrialSub, mockActiveSub])
      .mockResolvedValueOnce([mockGraceSub]);

    mockUpdate.mockResolvedValue({});

    const { AuditService } = jest.requireMock('../../audit/audit.service');
    const mockLog = jest.fn().mockResolvedValue({});
    AuditService.mockImplementation(() => ({ log: mockLog }));

    const service = new SubscriptionLifecycleService();
    await service.processExpiredSubscriptions();

    // Verify TRIAL transitioned to GRACE_PERIOD
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'sub-trial' },
      data: {
        status: SubscriptionStatus.GRACE_PERIOD,
        graceEndsAt: expect.any(Date),
      },
    });

    // Verify ACTIVE transitioned to GRACE_PERIOD
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'sub-active' },
      data: {
        status: SubscriptionStatus.GRACE_PERIOD,
        graceEndsAt: expect.any(Date),
      },
    });

    // Verify GRACE_PERIOD transitioned to SUSPENDED
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'sub-grace' },
      data: {
        status: SubscriptionStatus.SUSPENDED,
      },
    });

    // Verify audit logs were written
    expect(mockLog).toHaveBeenCalledWith({
      businessId: 'biz-trial',
      action: 'SUBSCRIPTION_ENTERED_GRACE_PERIOD',
      entityType: 'Subscription',
      entityId: 'sub-trial',
      newData: {
        businessId: 'biz-trial',
        subscriptionId: 'sub-trial',
        previousStatus: SubscriptionStatus.TRIAL,
        graceEndsAt: expect.any(Date),
      },
    });

    expect(mockLog).toHaveBeenCalledWith({
      businessId: 'biz-grace',
      action: 'SUBSCRIPTION_SUSPENDED',
      entityType: 'Subscription',
      entityId: 'sub-grace',
      newData: {
        businessId: 'biz-grace',
        subscriptionId: 'sub-grace',
        graceEndsAt: expect.any(Date),
      },
    });
  });

  it('should be resilient and continue transitions even if audit logging fails', async () => {
    const mockTrialSub = {
      id: 'sub-trial',
      businessId: 'biz-trial',
      status: SubscriptionStatus.TRIAL,
      expiresAt: new Date(Date.now() - 1000),
    };

    mockFindMany
      .mockResolvedValueOnce([mockTrialSub])
      .mockResolvedValueOnce([]);

    mockUpdate.mockResolvedValue({});

    const { AuditService } = jest.requireMock('../../audit/audit.service');
    AuditService.mockImplementationOnce(() => ({
      log: jest.fn().mockRejectedValue(new Error('Audit DB down')),
    }));

    const service = new SubscriptionLifecycleService();
    
    // Should complete successfully without throwing
    await expect(service.processExpiredSubscriptions()).resolves.toBeUndefined();
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'sub-trial' },
      data: {
        status: SubscriptionStatus.GRACE_PERIOD,
        graceEndsAt: expect.any(Date),
      },
    });
  });
});
