import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { extractAuth } from '../../app/middleware/rbac.middleware';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { AccountingRoutes } from '../../app/modules/accounting/accounting.routes';
import { AiRoutes } from '../../app/modules/ai/ai.routes';
import { WarehouseRoutes } from '../../app/modules/warehouse/warehouse.routes';
import { PermissionService } from '../../app/services/permission.service';
import { env } from '../../config/env';
import { FeatureCode } from '../../app/modules/subscriptions/types/feature.types';

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
const mockWarehouseCount = jest.fn();
const mockWarehouseCreate = jest.fn();
const mockAccountCreate = jest.fn();
const mockJournalEntryCreate = jest.fn();
const mockAuditLogCreate = jest.fn();
const mockUserRoleCount = jest.fn().mockResolvedValue(0);
const mockItemCount = jest.fn().mockResolvedValue(0);

jest.mock('../../app/lib/prisma', () => ({
  prisma: {
    userBusinessRole: {
      findUnique: (...a: any[]) => mockFindUniqueUserBizRole(...a),
      count: () => mockUserRoleCount(),
    },
    subscription: {
      findUnique: (...a: any[]) => mockSubscriptionFindUnique(...a),
    },
    warehouse: {
      count: (...a: any[]) => mockWarehouseCount(...a),
      create: (...a: any[]) => mockWarehouseCreate(...a),
    },
    item: {
      count: () => mockItemCount(),
    },
    account: {
      create: (...a: any[]) => mockAccountCreate(...a),
    },
    journalEntry: {
      create: (...a: any[]) => mockJournalEntryCreate(...a),
    },
    auditLog: {
      create: (...a: any[]) => mockAuditLogCreate(...a),
    },
    // Mock other models used in aggregate or similar calls
    journalLine: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { debit: 0, credit: 0 } }),
    },
  },
}));

// Mock Audit Service
jest.mock('../../app/modules/audit/audit.service', () => {
  return {
    AuditService: jest.fn().mockImplementation(() => {
      return {
        log: (...a: any[]) => mockAuditLogCreate(...a),
      };
    }),
  };
});

describe('Phase S4 — Feature Gating Integration Tests', () => {
  let app: express.Express;
  const mockJwtSecret = 'test-secret';
  let token: string;
  let currentPermissions: string[] = [];

  function setTestPermissions(permissions: string[]) {
    currentPermissions = permissions;
    const payload = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'OWNER',
      businessId: 'biz-1',
    };
    token = jwt.sign(payload, mockJwtSecret);

    // Resolve mocks
    (PermissionService.getPermissionsForUser as jest.Mock).mockResolvedValue(permissions);
    (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue(permissions);
  }

  function mockSubscriptionWithFeatures(planCode: string, features: FeatureCode[]) {
    const isTrial = planCode === 'TRIAL';
    mockSubscriptionFindUnique.mockResolvedValue({
      id: 'sub-1',
      businessId: 'biz-1',
      planId: 'plan-1',
      status: 'ACTIVE',
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 86400000),
      plan: {
        id: 'plan-1',
        code: planCode,
        name: planCode + ' Plan',
        maxUsers: isTrial ? 3 : 20,
        maxProducts: isTrial ? 100 : 5000,
        maxWarehouses: isTrial ? 1 : 10,
        features: features.map((featureKey) => ({
          id: `feat-${featureKey}`,
          planId: 'plan-1',
          featureKey,
          value: 'true',
        })),
      },
    });
  }

  beforeAll(() => {
    env.jwtSecret = mockJwtSecret;
    
    // Wire Express App
    app = express();
    app.use(express.json());
    app.use(cookieParser());
    
    // Auth Middleware Stubbing
    mockFindUniqueUserBizRole.mockImplementation(() => ({
      role: 'OWNER',
    }));

    app.use('/api/v1/accounting', AccountingRoutes);
    app.use('/api/v1/ai', AiRoutes);
    app.use('/api/v1/warehouses', WarehouseRoutes);

    app.use(globalErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to log errors
  function checkResponse(res: request.Response) {
    if (res.status === 500) {
      console.log('500 Error body:', res.body);
    }
    return res;
  }

  // ─── Accounting Gating ──────────────────────────────────────────────────
  describe('ACCOUNTING gating', () => {
    it('TRIAL plan - denies createAccount with 403 FEATURE_NOT_AVAILABLE', async () => {
      setTestPermissions(['accounting.create']);
      mockSubscriptionWithFeatures('TRIAL', [FeatureCode.INVENTORY, FeatureCode.POS]);

      const res = await request(app)
        .post('/api/v1/accounting/accounts')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cash', code: '1010', type: 'ASSET' });

      checkResponse(res);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('FEATURE_NOT_AVAILABLE');
      expect(mockAuditLogCreate).toHaveBeenCalled(); // Logs access denial
    });

    it('PRO plan - allows createAccount successfully', async () => {
      setTestPermissions(['accounting.create']);
      mockSubscriptionWithFeatures('PRO', [FeatureCode.ACCOUNTING]);
      mockAccountCreate.mockResolvedValue({ id: 'acc-1', name: 'Cash' });

      const res = await request(app)
        .post('/api/v1/accounting/accounts')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Cash', code: '1010', type: 'ASSET' });

      checkResponse(res);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('acc-1');
    });

    it('TRIAL plan - denies createJournalEntry with 403', async () => {
      setTestPermissions(['accounting.create']);
      mockSubscriptionWithFeatures('TRIAL', [FeatureCode.INVENTORY]);

      const res = await request(app)
        .post('/api/v1/accounting/journal-entries')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Manual entry',
          lines: [
            { accountId: 'a0000000-0000-0000-0000-000000000001', debit: 100, credit: 0 },
            { accountId: 'a0000000-0000-0000-0000-000000000002', debit: 0, credit: 100 }
          ]
        });

      checkResponse(res);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('FEATURE_NOT_AVAILABLE');
    });

    it('PRO plan - allows createJournalEntry successfully', async () => {
      setTestPermissions(['accounting.create']);
      mockSubscriptionWithFeatures('PRO', [FeatureCode.ACCOUNTING]);
      mockJournalEntryCreate.mockResolvedValue({ id: 'je-1', description: 'Manual entry' });

      const res = await request(app)
        .post('/api/v1/accounting/journal-entries')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Manual entry',
          lines: [
            { accountId: 'a0000000-0000-0000-0000-000000000001', debit: 100, credit: 0 },
            { accountId: 'a0000000-0000-0000-0000-000000000002', debit: 0, credit: 100 }
          ]
        });

      checkResponse(res);
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('je-1');
    });
  });

  // ─── AI Chat Gating ─────────────────────────────────────────────────────
  describe('AI_CHAT gating', () => {
    it('TRIAL plan - denies generateChat with 403 FEATURE_NOT_AVAILABLE', async () => {
      setTestPermissions(['ai.chat_use']); // Fix key
      mockSubscriptionWithFeatures('TRIAL', [FeatureCode.INVENTORY]);

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: 'test' });

      checkResponse(res);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('FEATURE_NOT_AVAILABLE');
    });

    it('PRO plan - allows generateChat successfully (calls Provider)', async () => {
      setTestPermissions(['ai.chat_use']); // Fix key
      mockSubscriptionWithFeatures('PRO', [FeatureCode.AI_CHAT]);
      
      // Mock provider return response text
      const mockChatResponse = 'Success response';
      const { AiService } = require('../../app/modules/ai/ai.service');
      jest.spyOn(AiService.prototype, 'generateChatResponse').mockResolvedValue({
        response: mockChatResponse,
        contextSource: 'business-info'
      });

      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: 'test' });

      checkResponse(res);
      expect(res.status).toBe(200);
      expect(res.body.data.content).toBe(mockChatResponse);
    });
  });

  // ─── Multi Branch Warehouse Gating ──────────────────────────────────────
  describe('MULTI_BRANCH gating', () => {
    it('Allows creating first warehouse regardless of plan (onboarding/on-demand)', async () => {
      setTestPermissions(['warehouse.create']);
      mockSubscriptionWithFeatures('TRIAL', [FeatureCode.INVENTORY]);
      mockWarehouseCount.mockResolvedValue(0); // This is the first warehouse!
      mockWarehouseCreate.mockResolvedValue({ id: 'wh-1', name: 'Main' });

      const res = await request(app)
        .post('/api/v1/warehouses')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Main' });

      checkResponse(res);
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('wh-1');
    });

    it('TRIAL plan - denies creating second warehouse (MULTI_BRANCH missing)', async () => {
      setTestPermissions(['warehouse.create']);
      mockSubscriptionWithFeatures('TRIAL', [FeatureCode.INVENTORY]);
      mockWarehouseCount.mockResolvedValue(1); // Already has 1 warehouse

      const res = await request(app)
        .post('/api/v1/warehouses')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Branch 2' });

      checkResponse(res);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('FEATURE_NOT_AVAILABLE');
    });

    it('PRO plan - allows creating second warehouse (has MULTI_BRANCH)', async () => {
      setTestPermissions(['warehouse.create']);
      mockSubscriptionWithFeatures('PRO', [FeatureCode.MULTI_BRANCH]);
      mockWarehouseCount.mockResolvedValue(1); // Already has 1 warehouse
      mockWarehouseCreate.mockResolvedValue({ id: 'wh-2', name: 'Branch 2' });

      const res = await request(app)
        .post('/api/v1/warehouses')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Branch 2' });

      checkResponse(res);
      expect(res.status).toBe(201);
      expect(res.body.data.id).toBe('wh-2');
    });
  });
});
