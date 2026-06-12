import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { extractAuth } from '../../app/middleware/rbac.middleware';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { SubscriptionRoutes } from '../../app/modules/subscriptions/subscription.routes';
import { PermissionService } from '../../app/services/permission.service';
import { env } from '../../config/env';
import router from '../../app/routes';

// Mock PermissionService
jest.mock('../../app/services/permission.service', () => {
  return {
    PermissionService: {
      getPermissionsForUser: jest.fn(),
      getPermissionsForRole: jest.fn(),
    },
  };
});

// Mock database models and functions
const mockFindUniqueUserBizRole = jest.fn();
const mockBusinessFindUnique = jest.fn();
const mockInvoiceFindUnique = jest.fn();
const mockInvoiceUpdate = jest.fn();
const mockPaymentCreate = jest.fn();
const mockPaymentFindUnique = jest.fn();
const mockPaymentFindFirst = jest.fn();
const mockPaymentUpdate = jest.fn();
const mockPaymentDelete = jest.fn();
const mockWebhookEventFindUnique = jest.fn();
const mockWebhookEventCreate = jest.fn();
const mockSubscriptionFindUnique = jest.fn();
const mockAuditLogCreate = jest.fn();

jest.mock('../../app/lib/prisma', () => {
  const localMockPrisma: any = {
    userBusinessRole: {
      findUnique: (...a: any[]) => mockFindUniqueUserBizRole(...a),
    },
    business: {
      findUnique: (...a: any[]) => mockBusinessFindUnique(...a),
    },
    subscriptionInvoice: {
      findUnique: (...a: any[]) => mockInvoiceFindUnique(...a),
      update: (...a: any[]) => mockInvoiceUpdate(...a),
    },
    subscriptionPayment: {
      create: (...a: any[]) => mockPaymentCreate(...a),
      findUnique: (...a: any[]) => mockPaymentFindUnique(...a),
      findFirst: (...a: any[]) => mockPaymentFindFirst(...a),
      update: (...a: any[]) => mockPaymentUpdate(...a),
      delete: (...a: any[]) => mockPaymentDelete(...a),
    },
    paymentWebhookEvent: {
      findUnique: (...a: any[]) => mockWebhookEventFindUnique(...a),
      create: (...a: any[]) => mockWebhookEventCreate(...a),
    },
    subscription: {
      findUnique: (...a: any[]) => mockSubscriptionFindUnique(...a),
    },
    auditLog: {
      create: (...a: any[]) => mockAuditLogCreate(...a),
    },
    $transaction: jest.fn(async (arg: any): Promise<any> => {
      if (typeof arg === 'function') {
        return await arg(localMockPrisma);
      }
      if (Array.isArray(arg)) {
        return await Promise.all(arg);
      }
      return arg;
    }),
  };

  return {
    prisma: localMockPrisma,
  };
});

describe('Phase S9 — Payment Gateway Integration Integration Tests', () => {
  let app: express.Express;
  const mockJwtSecret = 'test-secret';
  let token: string;

  function setTestPermissions(permissions: string[]) {
    const payload = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'OWNER',
      businessId: 'biz-1',
    };
    token = jwt.sign(payload, mockJwtSecret);

    (PermissionService.getPermissionsForUser as jest.Mock).mockResolvedValue(permissions);
    (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue(permissions);
  }

  beforeAll(() => {
    env.jwtSecret = mockJwtSecret;

    app = express();
    app.use(express.json());
    app.use(cookieParser());

    mockFindUniqueUserBizRole.mockImplementation(() => ({
      role: 'OWNER',
    }));

    // Register all routes through router mapping, including webhooks
    app.use('/api/v1', router);
    app.use(globalErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /subscription/payment-session validations', () => {
    it('rejects if invoice does not exist', async () => {
      setTestPermissions(['business.view']);
      mockInvoiceFindUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/subscription/payment-session')
        .send({ invoiceId: 'inv-not-exist', gateway: 'SSLCOMMERZ' })
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invoice not found');
    });

    it('rejects if invoice belongs to a different tenant', async () => {
      setTestPermissions(['business.view']);
      mockInvoiceFindUnique.mockResolvedValue({
        id: 'inv-123',
        businessId: 'other-biz',
        status: 'PENDING',
        amount: 1500,
      });

      const res = await request(app)
        .post('/api/v1/subscription/payment-session')
        .send({ invoiceId: 'inv-123', gateway: 'SSLCOMMERZ' })
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invoice does not belong to this business');
    });

    it('rejects if invoice is already paid/voided', async () => {
      setTestPermissions(['business.view']);
      mockInvoiceFindUnique.mockResolvedValue({
        id: 'inv-123',
        businessId: 'biz-1',
        status: 'PAID',
        amount: 1500,
      });

      const res = await request(app)
        .post('/api/v1/subscription/payment-session')
        .send({ invoiceId: 'inv-123', gateway: 'SSLCOMMERZ' })
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot pay an invoice that is PAID');
    });

    it('rejects if amount <= 0', async () => {
      setTestPermissions(['business.view']);
      mockInvoiceFindUnique.mockResolvedValue({
        id: 'inv-123',
        businessId: 'biz-1',
        status: 'PENDING',
        amount: 0,
      });

      const res = await request(app)
        .post('/api/v1/subscription/payment-session')
        .send({ invoiceId: 'inv-123', gateway: 'SSLCOMMERZ' })
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invoice amount must be greater than zero');
    });

    it('rejects if a verified payment already exists on this invoice', async () => {
      setTestPermissions(['business.view']);
      mockInvoiceFindUnique.mockResolvedValue({
        id: 'inv-123',
        businessId: 'biz-1',
        status: 'PENDING',
        amount: 100,
      });
      mockPaymentFindFirst.mockResolvedValue({
        id: 'pay-already',
        status: 'VERIFIED',
      });

      const res = await request(app)
        .post('/api/v1/subscription/payment-session')
        .send({ invoiceId: 'inv-123', gateway: 'SSLCOMMERZ' })
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already been paid and verified');
    });

    it('successfully initiates a payment session and returns links', async () => {
      setTestPermissions(['business.view']);
      mockInvoiceFindUnique.mockResolvedValue({
        id: 'inv-123',
        businessId: 'biz-1',
        status: 'PENDING',
        amount: 100,
        currency: 'BDT',
      });
      mockPaymentFindFirst.mockResolvedValue(null);
      mockBusinessFindUnique.mockResolvedValue({
        id: 'biz-1',
        name: 'Muzahid Farm',
        email: 'salim@farm.com',
      });
      mockPaymentCreate.mockResolvedValue({
        id: 'pay-pending-123',
        businessId: 'biz-1',
        invoiceId: 'inv-123',
        amount: 100,
        status: 'PENDING',
      });
      mockPaymentUpdate.mockResolvedValue({
        id: 'pay-pending-123',
        gatewayPaymentId: 'SSLC_pay-pending-123_1111',
      });

      const res = await request(app)
        .post('/api/v1/subscription/payment-session')
        .send({ invoiceId: 'inv-123', gateway: 'SSLCOMMERZ' })
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paymentUrl).toContain('gateway=sslcommerz');
      expect(res.body.data.gatewayReference).toContain('SSLC_pay-pending-123');
    });
  });

  describe('POST /webhooks/payments/:gateway', () => {
    it('processes verified payment callbacks, records webhook event and settles invoice', async () => {
      mockWebhookEventFindUnique.mockResolvedValue(null);
      mockPaymentFindUnique.mockResolvedValue({
        id: 'pay-pending-123',
        businessId: 'biz-1',
        invoiceId: 'inv-123',
        status: 'PENDING',
      });
      mockInvoiceFindUnique.mockResolvedValue({
        id: 'inv-123',
        status: 'PENDING',
      });

      const mockUpdatedPayment = {
        id: 'pay-pending-123',
        status: 'VERIFIED',
      };
      mockPaymentUpdate.mockResolvedValue(mockUpdatedPayment);

      const res = await request(app)
        .post('/api/v1/webhooks/payments/sslcommerz')
        .send({
          val_id: 'val_999',
          amount: '100',
          currency: 'BDT',
          tran_id: 'TXN_999',
          gateway_ref: 'SSLC_pay-pending-123_1111',
        })
        .set('x-sslcommerz-signature', 'valid-mock-sig');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('VERIFIED');

      // Verify invoice was settled in transaction
      expect(mockInvoiceUpdate).toHaveBeenCalledWith({
        where: { id: 'inv-123' },
        data: {
          status: 'PAID',
          paidAt: expect.any(Date),
        },
      });

      // Verify signature rejection block
      const rejectRes = await request(app)
        .post('/api/v1/webhooks/payments/sslcommerz')
        .send({
          val_id: 'val_888',
        })
        .set('x-sslcommerz-signature', 'invalid');

      expect(rejectRes.status).toBe(400);
      expect(rejectRes.body.success).toBe(false);
    });

    it('ensures idempotency - duplicate webhooks bypass invoice settlement', async () => {
      mockWebhookEventFindUnique.mockResolvedValue({
        id: 'evt-already-processed',
      });

      const res = await request(app)
        .post('/api/v1/webhooks/payments/sslcommerz')
        .send({
          val_id: 'val_999',
        });

      // Returns success but avoids re-running updates
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPaymentUpdate).not.toHaveBeenCalled();
    });
  });
});
