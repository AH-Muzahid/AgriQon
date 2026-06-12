import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { extractAuth } from '../../app/middleware/rbac.middleware';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { SubscriptionRoutes } from '../../app/modules/subscriptions/subscription.routes';
import { PermissionService } from '../../app/services/permission.service';
import { env } from '../../config/env';
import { SubscriptionStatus } from '../../generated/client';

// Mock PermissionService
jest.mock('../../app/services/permission.service', () => {
  return {
    PermissionService: {
      getPermissionsForUser: jest.fn(),
      getPermissionsForRole: jest.fn(),
    },
  };
});

// ─── Prisma Mocking ─────────────────────────────────────────────────────────
const mockFindUniqueUserBizRole = jest.fn();
const mockSubscriptionFindUnique = jest.fn();
const mockItemCount = jest.fn();
const mockUserRoleCount = jest.fn();
const mockWarehouseCount = jest.fn();

jest.mock('../../app/lib/prisma', () => {
  const localMockPrisma: any = {
    userBusinessRole: {
      findUnique: (...a: any[]) => mockFindUniqueUserBizRole(...a),
      count: (...a: any[]) => mockUserRoleCount(...a),
    },
    subscription: {
      findUnique: (...a: any[]) => mockSubscriptionFindUnique(...a),
    },
    item: {
      count: (...a: any[]) => mockItemCount(...a),
    },
    warehouse: {
      count: (...a: any[]) => mockWarehouseCount(...a),
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

describe('Phase S7 — Subscription UX Backend Visibility Integration Tests', () => {
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

  function mockSubscription(status: SubscriptionStatus, planCode = 'TRIAL') {
    mockSubscriptionFindUnique.mockResolvedValue({
      id: 'sub-1',
      businessId: 'biz-1',
      planId: 'plan-1',
      status,
      startsAt: new Date('2026-06-01T00:00:00Z'),
      expiresAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days remaining
      graceEndsAt: null,
      plan: {
        id: 'plan-1',
        code: planCode,
        name: planCode === 'TRIAL' ? 'Trial Plan' : 'Pro Plan',
        maxUsers: planCode === 'TRIAL' ? 3 : 20,
        maxProducts: planCode === 'TRIAL' ? 100 : 5000,
        maxWarehouses: planCode === 'TRIAL' ? 1 : 10,
        features: [
          { id: 'f-1', planId: 'plan-1', featureKey: 'INVENTORY', value: 'true' },
          { id: 'f-2', planId: 'plan-1', featureKey: 'POS', value: 'true' },
          { id: 'f-3', planId: 'plan-1', featureKey: 'CRM', value: 'true' },
          { id: 'f-4', planId: 'plan-1', featureKey: 'ACCOUNTING', value: planCode === 'PRO' ? 'true' : 'false' },
        ]
      },
    });
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

  describe('GET /subscription/current', () => {
    it('returns structured current subscription status and remaining trial days', async () => {
      setTestPermissions(['business.view']);
      mockSubscription(SubscriptionStatus.TRIAL, 'TRIAL');

      const res = await request(app)
        .get('/api/v1/subscription/current')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.plan.code).toBe('TRIAL');
      expect(res.body.data.plan.name).toBe('Trial Plan');
      expect(res.body.data.status).toBe('TRIAL');
      expect(res.body.data.daysRemaining).toBe(12);
      expect(res.body.data.graceEndsAt).toBeNull();
    });
  });

  describe('GET /subscription/usage', () => {
    it('returns counts vs plan limits for users, products, and warehouses', async () => {
      setTestPermissions(['business.view']);
      mockSubscription(SubscriptionStatus.TRIAL, 'TRIAL');
      mockUserRoleCount.mockResolvedValue(2);
      mockItemCount.mockResolvedValue(67);
      mockWarehouseCount.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/subscription/usage')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users.current).toBe(2);
      expect(res.body.data.users.limit).toBe(3);
      expect(res.body.data.products.current).toBe(67);
      expect(res.body.data.products.limit).toBe(100);
      expect(res.body.data.warehouses.current).toBe(1);
      expect(res.body.data.warehouses.limit).toBe(1);
    });
  });

  describe('GET /subscription/features', () => {
    it('returns features flag map for TRIAL plan', async () => {
      setTestPermissions(['business.view']);
      mockSubscription(SubscriptionStatus.TRIAL, 'TRIAL');

      const res = await request(app)
        .get('/api/v1/subscription/features')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.INVENTORY).toBe(true);
      expect(res.body.data.POS).toBe(true);
      expect(res.body.data.CRM).toBe(true);
      expect(res.body.data.ACCOUNTING).toBe(false);
      expect(res.body.data.AI_CHAT).toBe(false);
    });

    it('returns features flag map for PRO plan', async () => {
      setTestPermissions(['business.view']);
      mockSubscription(SubscriptionStatus.ACTIVE, 'PRO');

      const res = await request(app)
        .get('/api/v1/subscription/features')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.INVENTORY).toBe(true);
      expect(res.body.data.ACCOUNTING).toBe(true);
    });
  });
});
