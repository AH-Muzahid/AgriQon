import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { env } from '../../config/env';
import router from '../../app/routes';
import { AppError } from '../../app/errors/AppError';

// Mock SaaS services to isolate auth testing
const mockGetSaaSSummary = jest.fn();
const mockListTenants = jest.fn();
const mockOverrideTenantSubscription = jest.fn();

jest.mock('../../app/modules/subscriptions/saas-analytics.service', () => {
  return {
    SaaSAnalyticsService: jest.fn().mockImplementation(() => {
      return {
        getSaaSSummary: (...args: any[]) => mockGetSaaSSummary(...args),
      };
    }),
  };
});

jest.mock('../../app/modules/subscriptions/saas-admin.service', () => {
  return {
    SaaSAdminService: jest.fn().mockImplementation(() => {
      return {
        listTenants: (...args: any[]) => mockListTenants(...args),
        overrideTenantSubscription: (...args: any[]) => mockOverrideTenantSubscription(...args),
      };
    }),
  };
});

// Mock permission/auth lookups
const mockFindUniqueUserBizRole = jest.fn();
jest.mock('../../app/lib/prisma', () => {
  return {
    prisma: {
      userBusinessRole: {
        findUnique: (...a: any[]) => mockFindUniqueUserBizRole(...a),
      },
    },
  };
});

describe('Phase S11 — Platform Admin Routing & Auth Verification', () => {
  let app: express.Express;
  const mockJwtSecret = 'test-secret';

  function generateToken(role: string, businessId?: string) {
    const payload = {
      id: 'test-user-id',
      email: 'test@example.com',
      role, // SUPER_ADMIN, USER
      businessId: businessId || 'biz-1',
    };
    return jwt.sign(payload, mockJwtSecret);
  }

  beforeAll(() => {
    env.jwtSecret = mockJwtSecret;

    app = express();
    app.use(express.json());
    app.use(cookieParser());

    // Register backend router
    app.use('/api/v1', router);
    app.use(globalErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication & Role Validation', () => {
    it('Case 1: rejects guest user with 401', async () => {
      const res = await request(app).get('/api/v1/subscription/admin/analytics/summary');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized. Please login.');
    });

    it('Case 2: rejects standard tenant user (PlatformRole=USER) with 403', async () => {
      const token = generateToken('USER');

      const res = await request(app)
        .get('/api/v1/subscription/admin/analytics/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden. Platform administrator access required.');
    });

    it('Case 3: allows PlatformRole=SUPER_ADMIN with 200', async () => {
      const token = generateToken('SUPER_ADMIN');
      mockGetSaaSSummary.mockResolvedValue({ dummy: 'data' });

      const res = await request(app)
        .get('/api/v1/subscription/admin/analytics/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ dummy: 'data' });
    });
  });

  describe('Tenant Override Validation', () => {
    it('Case 4: rejects manual overrides missing reason parameter with 400', async () => {
      const token = generateToken('SUPER_ADMIN');
      
      // Override service throws AppError on validation failure
      mockOverrideTenantSubscription.mockRejectedValue(
        new AppError('An explicit reason must be provided for manual subscription overrides', 400)
      );

      const res = await request(app)
        .post('/api/v1/subscription/admin/tenants/biz-1/override')
        .send({
          planCode: 'PRO',
          status: 'ACTIVE',
          // reason missing
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('reason');
    });

    it('Case 5: successfully overrides subscription when reason is present', async () => {
      const token = generateToken('SUPER_ADMIN');
      const mockResult = { id: 'sub-1', status: 'ACTIVE' };
      mockOverrideTenantSubscription.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/v1/subscription/admin/tenants/biz-1/override')
        .send({
          planCode: 'PRO',
          status: 'ACTIVE',
          reason: 'Manual extension requested by customer care',
        })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockResult);
      expect(mockOverrideTenantSubscription).toHaveBeenCalledWith('biz-1', {
        planCode: 'PRO',
        status: 'ACTIVE',
        reason: 'Manual extension requested by customer care',
        expiresAt: undefined,
      });
    });
  });
});
