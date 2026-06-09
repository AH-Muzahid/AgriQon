import { SubscriptionService } from '../subscription.service';
import { SubscriptionRepository } from '../subscription.repository';
import { prisma } from '../../../lib/prisma';
import { AuditService } from '../../audit/audit.service';
import { BusinessService } from '../../business/business.service';
import { BusinessRepository } from '../../business/business.repository';
import { env } from '../../../../config/env';
import { AppError } from '../../../errors/AppError';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
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

describe('SubscriptionService & Onboarding Integration', () => {
  let subscriptionService: SubscriptionService;
  let mockSubscriptionRepo: jest.Mocked<SubscriptionRepository>;
  let auditServiceSpy: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscriptionRepo = {
      findActiveSubscription: jest.fn(),
      findPlanByCode: jest.fn(),
      create: jest.fn(),
    } as any;
    subscriptionService = new SubscriptionService(mockSubscriptionRepo);
    auditServiceSpy = new AuditService() as any;
  });

  describe('createTrialSubscription', () => {
    it('Case 1: should provision trial subscription successfully for new business', async () => {
      const mockBusinessId = 'biz-123';
      const mockPlan = {
        id: 'plan-trial-uuid',
        code: 'TRIAL',
        name: 'Trial Plan',
        isTrial: true,
        maxUsers: 3,
        maxProducts: 100,
        maxWarehouses: 1,
      };
      const mockSub = {
        id: 'sub-trial-uuid',
        businessId: mockBusinessId,
        planId: mockPlan.id,
        status: 'TRIAL',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      };

      mockSubscriptionRepo.findActiveSubscription.mockResolvedValue(null);
      mockSubscriptionRepo.findPlanByCode.mockResolvedValue(mockPlan as any);
      mockSubscriptionRepo.create.mockResolvedValue(mockSub as any);

      const result = await subscriptionService.createTrialSubscription({ businessId: mockBusinessId });

      expect(mockSubscriptionRepo.findActiveSubscription).toHaveBeenCalledWith(mockBusinessId);
      expect(mockSubscriptionRepo.findPlanByCode).toHaveBeenCalledWith('TRIAL');
      expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          businessId: mockBusinessId,
          planId: mockPlan.id,
          status: 'TRIAL',
        })
      );
      expect(result).toEqual(mockSub);
    });

    it('Case 2: should return existing subscription and log warning on duplicate provisioning', async () => {
      const mockBusinessId = 'biz-123';
      const mockExistingSub = {
        id: 'sub-existing-uuid',
        businessId: mockBusinessId,
        planId: 'plan-trial-uuid',
        status: 'TRIAL',
        startsAt: new Date(),
        expiresAt: new Date(),
      };

      mockSubscriptionRepo.findActiveSubscription.mockResolvedValue(mockExistingSub as any);

      const result = await subscriptionService.createTrialSubscription({ businessId: mockBusinessId });

      expect(mockSubscriptionRepo.findActiveSubscription).toHaveBeenCalledWith(mockBusinessId);
      expect(mockSubscriptionRepo.findPlanByCode).not.toHaveBeenCalled();
      expect(mockSubscriptionRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual(mockExistingSub);
    });
  });

  describe('Transactional Onboarding Integration', () => {
    it('Case 3: should rollback transaction if subscription creation fails', async () => {
      const mockBusinessRepo = {} as any;
      const businessService = new BusinessService(mockBusinessRepo);

      const mockTx = {
        business: {
          create: jest.fn().mockResolvedValue({ id: 'biz-123', name: 'AgriQon' }),
        },
        userBusinessRole: {
          create: jest.fn().mockResolvedValue({}),
        },
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
        account: {
          upsert: jest.fn().mockResolvedValue({}),
        },
        warehouse: {
          create: jest.fn().mockResolvedValue({}),
        },
        subscription: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn(),
        },
        subscriptionPlan: {
          findUnique: jest.fn().mockResolvedValue(null), // TRIAL plan missing!
        },
        auditLog: {
          create: jest.fn(),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      // Business service creation should throw error because TRIAL plan is missing inside transaction
      await expect(
        businessService.createBusiness({
          name: 'AgriQon',
          organizationId: 'org-123',
          userId: 'user-123',
        })
      ).rejects.toThrow('TRIAL subscription plan not found in database');

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTx.business.create).toHaveBeenCalled();
    });

    it('Case 4: should create business and subscription atomically when TRIAL plan exists', async () => {
      const mockBusinessRepo = {} as any;
      const businessService = new BusinessService(mockBusinessRepo);

      const mockTx = {
        business: {
          create: jest.fn().mockResolvedValue({ id: 'biz-123', name: 'AgriQon' }),
        },
        userBusinessRole: {
          create: jest.fn().mockResolvedValue({}),
        },
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
        account: {
          upsert: jest.fn().mockResolvedValue({}),
        },
        warehouse: {
          create: jest.fn().mockResolvedValue({}),
        },
        subscription: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'sub-new-123', businessId: 'biz-123' }),
        },
        subscriptionPlan: {
          findUnique: jest.fn().mockResolvedValue({ id: 'plan-trial', code: 'TRIAL', name: 'Trial Plan' }),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await businessService.createBusiness({
        name: 'AgriQon',
        organizationId: 'org-123',
        userId: 'user-123',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTx.business.create).toHaveBeenCalled();
      expect(mockTx.subscriptionPlan.findUnique).toHaveBeenCalled();
      expect(mockTx.subscription.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'biz-123', name: 'AgriQon' });
    });
  });
});
