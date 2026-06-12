import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { env } from '../../config/env';
import router from '../../app/routes';

// Mock PlatformService
const mockListPlans = jest.fn();
const mockGetPlan = jest.fn();
const mockCreatePlan = jest.fn();
const mockUpdatePlan = jest.fn();
const mockDeletePlan = jest.fn();
const mockGetSystemHealth = jest.fn();
const mockGetQueueMetrics = jest.fn();
const mockImpersonateUser = jest.fn();
const mockGetGlobalAuditLogs = jest.fn();

jest.mock('../../app/modules/platform/platform.service', () => {
  return {
    PlatformService: jest.fn().mockImplementation(() => {
      return {
        listPlans: (...args: any[]) => mockListPlans(...args),
        getPlan: (...args: any[]) => mockGetPlan(...args),
        createPlan: (...args: any[]) => mockCreatePlan(...args),
        updatePlan: (...args: any[]) => mockUpdatePlan(...args),
        deletePlan: (...args: any[]) => mockDeletePlan(...args),
        getSystemHealth: (...args: any[]) => mockGetSystemHealth(...args),
        getQueueMetrics: (...args: any[]) => mockGetQueueMetrics(...args),
        impersonateUser: (...args: any[]) => mockImpersonateUser(...args),
        getGlobalAuditLogs: (...args: any[]) => mockGetGlobalAuditLogs(...args),
      };
    }),
  };
});

describe('Phase S12 — Platform Admin Operations & Impersonation', () => {
  let app: express.Express;
  const mockJwtSecret = 'test-secret';

  function generateToken(role: string, businessId?: string) {
    const payload = {
      id: 'test-user-id',
      email: 'admin@example.com',
      role,
      businessId: businessId || 'biz-1',
    };
    return jwt.sign(payload, mockJwtSecret);
  }

  beforeAll(() => {
    env.jwtSecret = mockJwtSecret;

    app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.use('/api/v1', router);
    app.use(globalErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Security & RBAC Controls', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/v1/platform/plans');
      expect(res.status).toBe(401);
    });

    it('should reject standard tenant user request with 403', async () => {
      const token = generateToken('USER');
      const res = await request(app)
        .get('/api/v1/platform/plans')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('should allow SUPER_ADMIN request with 200', async () => {
      const token = generateToken('SUPER_ADMIN');
      mockListPlans.mockResolvedValue([{ id: 'plan-1', code: 'PRO', name: 'Pro Plan', price: 1000 }]);
      
      const res = await request(app)
        .get('/api/v1/platform/plans')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('Secure User Impersonation', () => {
    it('should call impersonateUser with admin context and target email', async () => {
      const token = generateToken('SUPER_ADMIN');
      mockImpersonateUser.mockResolvedValue({
        accessToken: 'impersonated-jwt-token',
        user: { id: 'target-user-1', email: 'target@example.com', role: 'USER' }
      });

      const res = await request(app)
        .post('/api/v1/platform/impersonate')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'target@example.com' });

      expect(res.status).toBe(200);
      expect(mockImpersonateUser).toHaveBeenCalledWith(
        { id: 'test-user-id', email: 'admin@example.com' },
        'target@example.com'
      );
      expect(res.body.data.accessToken).toBe('impersonated-jwt-token');
    });

    it('should return error if email parameter is missing', async () => {
      const token = generateToken('SUPER_ADMIN');
      const res = await request(app)
        .post('/api/v1/platform/impersonate')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(500); // Triggered validation check
    });
  });

  describe('System Health & Background Job Queue Metrics', () => {
    it('should retrieve system health reports successfully', async () => {
      const token = generateToken('SUPER_ADMIN');
      mockGetSystemHealth.mockResolvedValue({ status: 'HEALTHY', database: 'UP' });

      const res = await request(app)
        .get('/api/v1/platform/health')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('HEALTHY');
    });

    it('should retrieve background job metrics successfully', async () => {
      const token = generateToken('SUPER_ADMIN');
      mockGetQueueMetrics.mockResolvedValue([{ name: 'Email', active: 0, failed: 0 }]);

      const res = await request(app)
        .get('/api/v1/platform/queues')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });
});
