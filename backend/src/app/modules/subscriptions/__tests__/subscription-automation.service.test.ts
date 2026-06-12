import { SubscriptionAutomationService } from '../subscription-automation.service';
import { prisma } from '../../../lib/prisma';
import { AuditService } from '../../audit/audit.service';
import { AppError } from '../../../errors/AppError';
import { SubscriptionStatus, SubscriptionChangeRequestStatus } from '../../../../generated/client';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
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

describe('SubscriptionAutomationService', () => {
  let automationService: SubscriptionAutomationService;
  let mockTx: any;

  beforeEach(() => {
    jest.clearAllMocks();
    automationService = new SubscriptionAutomationService();

    mockTx = {
      subscriptionPayment: {
        findUnique: jest.fn(),
      },
      subscriptionInvoice: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      subscriptionChangeRequest: {
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      subscription: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      subscriptionPlan: {
        findUnique: jest.fn(),
      },
      subscriptionEvent: {
        create: jest.fn(),
      },
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
      return callback(mockTx);
    });
  });

  describe('handlePaymentVerified', () => {
    it('should successfully process upgrade automation when valid request and matching invoice amount', async () => {
      const mockPaymentId = 'pay-123';
      const mockPayment = {
        id: mockPaymentId,
        businessId: 'biz-123',
        invoiceId: 'invoice-123',
        status: 'VERIFIED',
        invoice: {
          id: 'invoice-123',
          amount: 1000,
          changeRequest: {
            id: 'request-123',
            businessId: 'biz-123',
            subscriptionId: 'sub-123',
            type: 'UPGRADE',
            requestedPlanCode: 'PRO',
            status: 'PENDING',
          },
        },
      };

      const mockSubscription = {
        id: 'sub-123',
        expiresAt: new Date(Date.now() - 10000), // currently expired
        plan: {
          code: 'TRIAL',
        },
      };

      const mockPlan = {
        id: 'plan-pro-id',
        code: 'PRO',
        name: 'Pro Plan',
      };

      mockTx.subscriptionPayment.findUnique.mockResolvedValue(mockPayment);
      mockTx.subscriptionChangeRequest.updateMany.mockResolvedValue({ count: 1 });
      mockTx.subscription.findUnique.mockResolvedValue(mockSubscription);
      mockTx.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);

      const result = await automationService.handlePaymentVerified(mockPaymentId);

      expect(result.success).toBe(true);
      expect(result.newPlanCode).toBe('PRO');
      expect(mockTx.subscriptionChangeRequest.updateMany).toHaveBeenCalledWith({
        where: { id: 'request-123', status: SubscriptionChangeRequestStatus.PENDING },
        data: { status: SubscriptionChangeRequestStatus.PROCESSING },
      });
      expect(mockTx.subscriptionPlan.findUnique).toHaveBeenCalledWith({ where: { code: 'PRO' } });
      expect(mockTx.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-123' },
          data: expect.objectContaining({
            planId: 'plan-pro-id',
            status: SubscriptionStatus.ACTIVE,
            graceEndsAt: null,
          }),
        })
      );
      expect(mockTx.subscriptionChangeRequest.update).toHaveBeenCalledWith({
        where: { id: 'request-123' },
        data: {
          status: SubscriptionChangeRequestStatus.COMPLETED,
          processedAt: expect.any(Date),
        },
      });
    });

    it('should throw error and set change request to FAILED if invoice amount does not match expected plan price', async () => {
      const mockPaymentId = 'pay-123';
      const mockPayment = {
        id: mockPaymentId,
        businessId: 'biz-123',
        invoiceId: 'invoice-123',
        status: 'VERIFIED',
        invoice: {
          id: 'invoice-123',
          amount: 500, // Expected for PRO is 1000
          changeRequest: {
            id: 'request-123',
            businessId: 'biz-123',
            subscriptionId: 'sub-123',
            type: 'UPGRADE',
            requestedPlanCode: 'PRO',
            status: 'PENDING',
          },
        },
      };

      mockTx.subscriptionPayment.findUnique.mockResolvedValue(mockPayment);
      mockTx.subscriptionChangeRequest.updateMany.mockResolvedValue({ count: 1 });

      await expect(
        automationService.handlePaymentVerified(mockPaymentId)
      ).rejects.toThrow('Invoice amount (500) does not match expected plan price (1000)');

      expect(mockTx.subscriptionChangeRequest.update).toHaveBeenCalledWith({
        where: { id: 'request-123' },
        data: {
          status: SubscriptionChangeRequestStatus.FAILED,
          processedAt: expect.any(Date),
        },
      });
    });

    it('should skip processing if status is not PENDING (idempotency guard)', async () => {
      const mockPaymentId = 'pay-123';
      const mockPayment = {
        id: mockPaymentId,
        businessId: 'biz-123',
        invoiceId: 'invoice-123',
        status: 'VERIFIED',
        invoice: {
          id: 'invoice-123',
          amount: 1000,
          changeRequest: {
            id: 'request-123',
            status: 'PROCESSING', // already processing
          },
        },
      };

      mockTx.subscriptionPayment.findUnique.mockResolvedValue(mockPayment);
      mockTx.subscriptionChangeRequest.updateMany.mockResolvedValue({ count: 0 }); // lock failed

      const result = await automationService.handlePaymentVerified(mockPaymentId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Request already processed or processing.');
      expect(mockTx.subscription.update).not.toHaveBeenCalled();
    });
  });
});
