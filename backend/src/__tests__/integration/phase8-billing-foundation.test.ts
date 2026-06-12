import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { extractAuth } from '../../app/middleware/rbac.middleware';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { SubscriptionRoutes } from '../../app/modules/subscriptions/subscription.routes';
import { PermissionService } from '../../app/services/permission.service';
import { env } from '../../config/env';

// Mock PermissionService
jest.mock('../../app/services/permission.service', () => {
  return {
    PermissionService: {
      getPermissionsForUser: jest.fn(),
      getPermissionsForRole: jest.fn(),
    },
  };
});

// Mock AuditLog creation
const mockAuditLogCreate = jest.fn();

// Mock Prisma models
const mockFindUniqueUserBizRole = jest.fn();
const mockSubscriptionFindUnique = jest.fn();
const mockSubscriptionPlanFindUnique = jest.fn();
const mockInvoiceCreate = jest.fn();
const mockInvoiceFindUnique = jest.fn();
const mockInvoiceUpdate = jest.fn();
const mockPaymentCreate = jest.fn();
const mockChangeRequestCreate = jest.fn();
const mockInvoiceFindMany = jest.fn();
const mockPaymentFindMany = jest.fn();
const mockChangeRequestFindMany = jest.fn();

jest.mock('../../app/lib/prisma', () => {
  const localMockPrisma: any = {
    userBusinessRole: {
      findUnique: (...a: any[]) => mockFindUniqueUserBizRole(...a),
    },
    subscription: {
      findUnique: (...a: any[]) => mockSubscriptionFindUnique(...a),
    },
    subscriptionPlan: {
      findUnique: (...a: any[]) => mockSubscriptionPlanFindUnique(...a),
    },
    subscriptionInvoice: {
      create: (...a: any[]) => mockInvoiceCreate(...a),
      findUnique: (...a: any[]) => mockInvoiceFindUnique(...a),
      update: (...a: any[]) => mockInvoiceUpdate(...a),
      findMany: (...a: any[]) => mockInvoiceFindMany(...a),
    },
    subscriptionPayment: {
      create: (...a: any[]) => mockPaymentCreate(...a),
      findMany: (...a: any[]) => mockPaymentFindMany(...a),
    },
    subscriptionChangeRequest: {
      create: (...a: any[]) => mockChangeRequestCreate(...a),
      findMany: (...a: any[]) => mockChangeRequestFindMany(...a),
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

describe('Phase S8 — Billing Foundation Integration Tests', () => {
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

    app.use('/api/v1/subscription', SubscriptionRoutes);
    app.use(globalErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /subscription/billing & GET /subscription/history', () => {
    it('retrieves billing overview with invoices, payments, and requests', async () => {
      setTestPermissions(['business.view']);

      const mockInvoices = [
        { id: 'inv-1', invoiceNumber: 'INV-SUB-20260612-1111', amount: 1000, status: 'PENDING' }
      ];
      const mockPayments = [
        { id: 'pay-1', invoiceId: 'inv-1', amount: 1000, method: 'BANK_TRANSFER', status: 'SUCCESS' }
      ];
      const mockRequests = [
        { id: 'req-1', type: 'UPGRADE', requestedPlanCode: 'PRO', status: 'PENDING' }
      ];

      mockInvoiceFindMany.mockResolvedValue(mockInvoices);
      mockPaymentFindMany.mockResolvedValue(mockPayments);
      mockChangeRequestFindMany.mockResolvedValue(mockRequests);

      const res = await request(app)
        .get('/api/v1/subscription/billing')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoices).toEqual(mockInvoices);
      expect(res.body.data.payments).toEqual(mockPayments);
      expect(res.body.data.changeRequests).toEqual(mockRequests);
    });
  });

  describe('POST /subscription/upgrade-request', () => {
    it('creates upgrade request without changing actual subscription', async () => {
      setTestPermissions(['business.view']);

      mockSubscriptionFindUnique.mockResolvedValue({
        id: 'sub-123',
        businessId: 'biz-1',
        planId: 'plan-1',
        status: 'TRIAL',
        expiresAt: new Date(),
      });

      mockSubscriptionPlanFindUnique.mockResolvedValue({
        id: 'plan-pro',
        code: 'PRO',
        name: 'Professional Plan',
      });

      const mockCreatedRequest = {
        id: 'req-123',
        businessId: 'biz-1',
        subscriptionId: 'sub-123',
        type: 'UPGRADE',
        requestedPlanCode: 'PRO',
        status: 'PENDING',
        requestedAt: new Date(),
      };
      mockChangeRequestCreate.mockResolvedValue(mockCreatedRequest);

      const res = await request(app)
        .post('/api/v1/subscription/upgrade-request')
        .send({ requestedPlanCode: 'PRO' })
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('UPGRADE');
      expect(res.body.data.requestedPlanCode).toBe('PRO');
      expect(res.body.data.status).toBe('PENDING');

      // Verify audit event logged
      expect(mockAuditLogCreate).toHaveBeenCalled();
    });
  });

  describe('POST /subscription/renewal-request', () => {
    it('creates renewal request without changing actual subscription', async () => {
      setTestPermissions(['business.view']);

      mockSubscriptionFindUnique.mockResolvedValue({
        id: 'sub-123',
        businessId: 'biz-1',
        planId: 'plan-1',
        status: 'ACTIVE',
        expiresAt: new Date(),
      });

      mockSubscriptionPlanFindUnique.mockResolvedValue({
        id: 'plan-pro',
        code: 'PRO',
        name: 'Professional Plan',
      });

      const mockCreatedRequest = {
        id: 'req-456',
        businessId: 'biz-1',
        subscriptionId: 'sub-123',
        type: 'RENEWAL',
        requestedPlanCode: 'PRO',
        status: 'PENDING',
        requestedAt: new Date(),
      };
      mockChangeRequestCreate.mockResolvedValue(mockCreatedRequest);

      const res = await request(app)
        .post('/api/v1/subscription/renewal-request')
        .send({ requestedPlanCode: 'PRO' })
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.type).toBe('RENEWAL');
      expect(res.body.data.requestedPlanCode).toBe('PRO');
      expect(res.body.data.status).toBe('PENDING');

      // Verify audit event logged
      expect(mockAuditLogCreate).toHaveBeenCalled();
    });
  });
});
