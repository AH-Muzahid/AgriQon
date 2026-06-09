import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { extractAuth } from '../../app/middleware/rbac.middleware';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { ProductRoutes } from '../../app/modules/products/product.routes';
import { OrganizationRoutes } from '../../app/modules/organization/organization.routes';
import { WarehouseRoutes } from '../../app/modules/warehouse/warehouse.routes';
import { PermissionService } from '../../app/services/permission.service';
import { env } from '../../config/env';
import { ResourceType } from '../../app/modules/subscriptions/types/resource.types';

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
const mockUserRoleCount = jest.fn();
const mockWarehouseCount = jest.fn();
const mockItemCount = jest.fn();
const mockWarehouseCreate = jest.fn();
const mockItemCreate = jest.fn();
const mockUserInvite = jest.fn();
const mockAuditLogCreate = jest.fn();
const mockOutboxEventCreate = jest.fn();
const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();

jest.mock('../../app/lib/prisma', () => {
  const localMockPrisma: any = {
    user: {
      findUnique: (...a: any[]) => mockUserFindUnique(...a),
      create: (...a: any[]) => mockUserCreate(...a),
    },
    userBusinessRole: {
      findUnique: (...a: any[]) => mockFindUniqueUserBizRole(...a),
      count: (...a: any[]) => mockUserRoleCount(...a),
      create: (...a: any[]) => mockUserInvite(...a),
      upsert: (...a: any[]) => mockUserInvite(...a),
    },
    subscription: {
      findUnique: (...a: any[]) => mockSubscriptionFindUnique(...a),
    },
    warehouse: {
      count: (...a: any[]) => mockWarehouseCount(...a),
      create: (...a: any[]) => mockWarehouseCreate(...a),
    },
    item: {
      count: (...a: any[]) => mockItemCount(...a),
      create: (...a: any[]) => mockItemCreate(...a),
    },
    auditLog: {
      create: (...a: any[]) => mockAuditLogCreate(...a),
    },
    outboxEvent: {
      create: (...a: any[]) => mockOutboxEventCreate(...a),
    },
    $transaction: jest.fn(async (callback: (tx: any) => Promise<any>): Promise<any> => {
      return await callback(localMockPrisma);
    }),
  };

  return {
    prisma: localMockPrisma,
  };
});

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

describe('Phase S5 — Usage Limits Integration Tests', () => {
  let app: express.Express;
  const mockJwtSecret = 'test-secret';
  let token: string;
  let currentPermissions: string[] = [];

  const validCategoryId = 'c1111111-1111-1111-1111-111111111111';
  const validBrandId = 'b1111111-1111-1111-1111-111111111111';

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

  function mockSubscription(planCode: string, maxUsers = 3, maxProducts = 100, maxWarehouses = 1) {
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
        maxUsers,
        maxProducts,
        maxWarehouses,
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

    app.use('/api/v1/products', ProductRoutes);
    app.use('/api/v1/organization', OrganizationRoutes);
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

  // ─── User Invitation Gating ──────────────────────────────────────────────
  describe('USERS limit gating', () => {
    it('TRIAL plan - allows invitation when count is under maxUsers (e.g. 2)', async () => {
      setTestPermissions(['business.manage']);
      mockSubscription('TRIAL', 3);
      mockUserRoleCount.mockResolvedValue(2);
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({ id: 'user-2', name: 'Bob', email: 'bob@example.com' });
      mockUserInvite.mockResolvedValue({
        userId: 'user-2',
        businessId: 'biz-1',
        role: 'STAFF',
      });

      const res = await request(app)
        .post('/api/v1/organization/users/invite')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bob', email: 'bob@example.com', role: 'STAFF' });

      checkResponse(res);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('bob@example.com');
    });

    it('TRIAL plan - blocks invitation with 403 USAGE_LIMIT_EXCEEDED when count is equal to maxUsers (3)', async () => {
      setTestPermissions(['business.manage']);
      mockSubscription('TRIAL', 3);
      mockUserRoleCount.mockResolvedValue(3);

      const res = await request(app)
        .post('/api/v1/organization/users/invite')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bob', email: 'bob@example.com', role: 'STAFF' });

      checkResponse(res);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('USAGE_LIMIT_EXCEEDED');
      expect(res.body.resource).toBe(ResourceType.USERS);
      expect(res.body.current).toBe(3);
      expect(res.body.limit).toBe(3);
      expect(mockAuditLogCreate).toHaveBeenCalled();
    });
  });

  // ─── Product Creation Gating ─────────────────────────────────────────────
  describe('PRODUCTS limit gating', () => {
    it('TRIAL plan - allows product creation when count is under maxProducts (e.g. 99)', async () => {
      setTestPermissions(['product.create']);
      mockSubscription('TRIAL', 3, 100);
      mockItemCount.mockResolvedValue(99);
      mockItemCreate.mockResolvedValue({ id: 'prod-1', title: 'Fertilizer', price: 50.0 });
      mockOutboxEventCreate.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/products')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Fertilizer', price: 50.0, categoryId: validCategoryId, brandId: validBrandId });

      checkResponse(res);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('prod-1');
    });

    it('TRIAL plan - blocks product creation with 403 USAGE_LIMIT_EXCEEDED when count is equal to maxProducts (100)', async () => {
      setTestPermissions(['product.create']);
      mockSubscription('TRIAL', 3, 100);
      mockItemCount.mockResolvedValue(100);

      const res = await request(app)
        .post('/api/v1/products')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Fertilizer', price: 50.0, categoryId: validCategoryId, brandId: validBrandId });

      checkResponse(res);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('USAGE_LIMIT_EXCEEDED');
      expect(res.body.resource).toBe(ResourceType.PRODUCTS);
      expect(res.body.current).toBe(100);
      expect(res.body.limit).toBe(100);
    });
  });

  // ─── Warehouse Creation Gating ───────────────────────────────────────────
  describe('WAREHOUSES limit gating', () => {
    it('TRIAL plan - allows warehouse creation when count is under maxWarehouses (0)', async () => {
      setTestPermissions(['warehouse.create']);
      mockSubscription('TRIAL', 3, 100, 1);
      mockWarehouseCount.mockResolvedValue(0);
      mockWarehouseCreate.mockResolvedValue({ id: 'wh-1', name: 'Storage 1' });

      const res = await request(app)
        .post('/api/v1/warehouses')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Storage 1' });

      checkResponse(res);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('wh-1');
    });

    it('PRO plan - blocks warehouse creation with 403 USAGE_LIMIT_EXCEEDED when count is equal to maxWarehouses (10)', async () => {
      setTestPermissions(['warehouse.create']);
      mockSubscriptionFindUnique.mockResolvedValue({
        id: 'sub-1',
        businessId: 'biz-1',
        planId: 'plan-1',
        status: 'ACTIVE',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        plan: {
          id: 'plan-1',
          code: 'PRO',
          name: 'PRO Plan',
          maxUsers: 20,
          maxProducts: 5000,
          maxWarehouses: 10,
          features: [
            { id: 'feat-MULTI_BRANCH', planId: 'plan-1', featureKey: 'MULTI_BRANCH', value: 'true' }
          ],
        },
      });
      mockWarehouseCount.mockResolvedValue(10);

      const res = await request(app)
        .post('/api/v1/warehouses')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Storage 11' });

      checkResponse(res);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('USAGE_LIMIT_EXCEEDED');
      expect(res.body.resource).toBe(ResourceType.WAREHOUSES);
      expect(res.body.current).toBe(10);
      expect(res.body.limit).toBe(10);
    });
  });
});
