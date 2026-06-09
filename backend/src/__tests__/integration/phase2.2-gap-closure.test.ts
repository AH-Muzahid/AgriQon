import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { extractAuth } from '../../app/middleware/rbac.middleware';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { AnalyticsRoutes } from '../../app/modules/analytics/analytics.routes';
import { PaymentRoutes } from '../../app/modules/payments/payment.routes';
import { OrganizationRoutes } from '../../app/modules/organization/organization.routes';
import { RoleRoutes } from '../../app/modules/roles/role.routes';
import { PermissionRoutes } from '../../app/modules/permissions/permission.routes';
import { SubscriptionRoutes } from '../../app/modules/subscriptions/subscription.routes';
import { PermissionService } from '../../app/services/permission.service';
import { env } from '../../config/env';
import { PaymentStatus } from '../../generated/client';

// ─── Prisma Mocking ─────────────────────────────────────────────────────────
const mockFindUniqueUserBizRole = jest.fn();
const mockFindManyUserCustomRole = jest.fn();
const mockFindManyCustomRole = jest.fn();
const mockFindFirstCustomRole = jest.fn();
const mockCreateCustomRole = jest.fn();
const mockUpdateCustomRole = jest.fn();
const mockDeleteCustomRole = jest.fn();

const mockPaymentAggregate = jest.fn();
const mockRefundAggregate = jest.fn();
const mockOrderCount = jest.fn();
const mockCustomerCount = jest.fn();
const mockItemFindMany = jest.fn();
const mockPaymentFindMany = jest.fn();
const mockPaymentFindFirst = jest.fn();
const mockPurchaseOrderFindMany = jest.fn();

const mockSubscriptionFindUnique = jest.fn();
const mockSubscriptionCreate = jest.fn();
const mockPlanFindUnique = jest.fn();
const mockPlanCreate = jest.fn();
const mockUserBusinessRoleCount = jest.fn();
const mockWarehouseCount = jest.fn();
const mockItemCount = jest.fn();

const mockUserFindUnique = jest.fn();
const mockUserCreate = jest.fn();
const mockUserBusinessRoleUpsert = jest.fn();
const mockAuditLogCreate = jest.fn();

jest.mock('../../app/lib/prisma', () => ({
  prisma: {
    userBusinessRole: {
      findUnique: (...a: any[]) => mockFindUniqueUserBizRole(...a),
      findMany: jest.fn().mockResolvedValue([]),
      count: (...a: any[]) => mockUserBusinessRoleCount(...a),
      upsert: (...a: any[]) => mockUserBusinessRoleUpsert(...a),
    },
    userCustomRole: {
      findMany: (...a: any[]) => mockFindManyUserCustomRole(...a),
    },
    customRole: {
      findMany: (...a: any[]) => mockFindManyCustomRole(...a),
      findFirst: (...a: any[]) => mockFindFirstCustomRole(...a),
      create: (...a: any[]) => mockCreateCustomRole(...a),
      update: (...a: any[]) => mockUpdateCustomRole(...a),
      delete: (...a: any[]) => mockDeleteCustomRole(...a),
    },
    payment: {
      aggregate: (...a: any[]) => mockPaymentAggregate(...a),
      findMany: (...a: any[]) => mockPaymentFindMany(...a),
      findFirst: (...a: any[]) => mockPaymentFindFirst(...a),
      count: jest.fn().mockResolvedValue(100),
    },
    refund: {
      aggregate: (...a: any[]) => mockRefundAggregate(...a),
    },
    order: {
      count: (...a: any[]) => mockOrderCount(...a),
    },
    customer: {
      count: (...a: any[]) => mockCustomerCount(...a),
    },
    item: {
      findMany: (...a: any[]) => mockItemFindMany(...a),
      count: (...a: any[]) => mockItemCount(...a),
    },
    purchaseOrder: {
      findMany: (...a: any[]) => mockPurchaseOrderFindMany(...a),
    },
    subscription: {
      findUnique: (...a: any[]) => mockSubscriptionFindUnique(...a),
      create: (...a: any[]) => mockSubscriptionCreate(...a),
    },
    subscriptionPlan: {
      findUnique: (...a: any[]) => mockPlanFindUnique(...a),
      create: (...a: any[]) => mockPlanCreate(...a),
    },
    warehouse: {
      count: (...a: any[]) => mockWarehouseCount(...a),
    },
    user: {
      findUnique: (...a: any[]) => mockUserFindUnique(...a),
      create: (...a: any[]) => mockUserCreate(...a),
    },
    auditLog: {
      findMany: jest.fn().mockResolvedValue([]),
      create: (...a: any[]) => mockAuditLogCreate(...a),
    },
    rolePermission: {
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn().mockImplementation((args) => {
      if (Array.isArray(args)) {
        return Promise.all(args);
      }
      return args(require('../../app/lib/prisma').prisma);
    }),
  },
}));

// Mock global PermissionService dynamic resolver to control RBAC per test
jest.mock('../../app/services/permission.service', () => {
  return {
    PermissionService: {
      getPermissionsForRole: jest.fn(),
      getPermissionsForUser: jest.fn(),
    },
  };
});

// ─── Setup Minimal Test App ──────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(extractAuth);

app.use('/api/v1/dashboard', AnalyticsRoutes);
app.use('/api/v1/analytics', AnalyticsRoutes);
app.use('/api/v1/payments', PaymentRoutes);
app.use('/api/v1/organization', OrganizationRoutes);
app.use('/api/v1/roles', RoleRoutes);
app.use('/api/v1/permissions', PermissionRoutes);
app.use('/api/v1/subscription', SubscriptionRoutes);

app.use(globalErrorHandler);

// ─── Constants & Helpers ─────────────────────────────────────────────────────
const JWT_SECRET = env.jwtSecret;
const TEST_BIZ_ID = 'biz-test-1111-2222';

function makeToken(businessId: string = TEST_BIZ_ID): string {
  return jwt.sign(
    {
      sub: 'user-id-test',
      role: 'USER',
      email: 'test@agriqon.test',
      businessId,
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

function setTestPermissions(permissions: string[], role: 'OWNER' | 'MANAGER' | 'STAFF' = 'OWNER') {
  mockFindUniqueUserBizRole.mockResolvedValue({ role });
  (PermissionService.getPermissionsForUser as jest.Mock).mockResolvedValue(permissions);
  (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue(permissions);
}

// ─── Test Suite ──────────────────────────────────────────────────────────────
describe('Phase 2.2 Integration Tests - Backend Gap Closure', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Dashboard & Analytics API', () => {
    it('GET /api/v1/dashboard/summary - returns aggregate summary statistics for active tenant', async () => {
      setTestPermissions(['report.view']);

      // Setup Repository mocks
      mockPaymentAggregate.mockResolvedValue({ _sum: { amount: 50000 } });
      mockRefundAggregate.mockResolvedValue({ _sum: { amount: 5000 } });
      mockOrderCount.mockResolvedValue(15);
      mockCustomerCount.mockResolvedValue(8);
      
      // Valuation mock (2 items with stocks)
      mockItemFindMany.mockResolvedValue([
        {
          costPrice: 100,
          lowStockThreshold: 5,
          inventory: [{ availableStock: 10 }, { availableStock: 2 }] // Total 12 stock (threshold 5, no alert)
        },
        {
          costPrice: 50,
          lowStockThreshold: 10,
          inventory: [{ availableStock: 2 }] // Total 2 stock (threshold 10, alert)
        }
      ]);

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        revenue: 45000, // 50000 payment - 5000 refund
        ordersCount: 15,
        customersCount: 8,
        inventoryValue: 1300, // (12 * 100) + (2 * 50) = 1200 + 100
        lowStockAlerts: 1, // Second item has stock 2 < lowStockThreshold 10
      });
    });

    it('GET /api/v1/analytics/financial-trend - returns revenue and expense trends', async () => {
      setTestPermissions(['report.view']);

      // Mock date queries
      mockPaymentFindMany.mockResolvedValue([
        { amount: 1000, createdAt: new Date('2026-05-15T10:00:00Z') },
        { amount: 2000, createdAt: new Date('2026-06-05T12:00:00Z') }
      ]);
      mockPurchaseOrderFindMany.mockResolvedValue([
        { total: 500, createdAt: new Date('2026-05-20T10:00:00Z') }
      ]);

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/analytics/financial-trend')
        .query({ startDate: '2026-05-01', endDate: '2026-06-30' })
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.revenueTrend).toContainEqual({ month: '2026-05', amount: 1000 });
      expect(res.body.data.revenueTrend).toContainEqual({ month: '2026-06', amount: 2000 });
      expect(res.body.data.expenseTrend).toContainEqual({ month: '2026-05', amount: 500 });
      expect(res.body.data.expenseTrend).toContainEqual({ month: '2026-06', amount: 0 });
    });

    it('GET /api/v1/analytics/financial-trend - invalid dates are treated as undefined by validation schema (optional type only)', async () => {
      setTestPermissions(['report.view']);

      mockPaymentFindMany.mockResolvedValue([]);
      mockPurchaseOrderFindMany.mockResolvedValue([]);

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/analytics/financial-trend')
        .query({ startDate: 'not-a-date' })
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      // Expect 200 because Zod schema validates it as string (optional), not datetime format
      expect(res.status).toBe(200);
    });
  });

  describe('2. Payments Ledger API', () => {
    it('GET /api/v1/payments - lists payments with filters and pagination', async () => {
      setTestPermissions(['payment.view']);

      // Setup mock list
      mockPaymentFindMany.mockResolvedValue([
        {
          id: 'pay-123',
          amount: 500,
          status: PaymentStatus.COMPLETED,
          createdAt: new Date(),
          invoice: { id: 'inv-123', invoiceNumber: 'INV-001' },
          order: { id: 'ord-123', customer: { id: 'cust-123', name: 'Al-Amin' } }
        }
      ]);

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/payments')
        .query({ page: 2, limit: 5, status: PaymentStatus.COMPLETED })
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toEqual({ page: 2, limit: 5, total: 100 });
      expect(res.body.data[0].id).toBe('pay-123');
    });

    it('GET /api/v1/payments/:id - retrieves payment details with audit trail', async () => {
      setTestPermissions(['payment.view']);

      // Mock individual payment retrieval
      mockPaymentFindFirst.mockResolvedValue({
        id: 'pay-123',
        amount: 500,
        status: PaymentStatus.COMPLETED,
        businessId: TEST_BIZ_ID,
        createdAt: new Date(),
        invoice: { id: 'inv-123', invoiceNumber: 'INV-001' },
        order: { id: 'ord-123', customer: { id: 'cust-123', name: 'Al-Amin' } }
      });

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/payments/pay-123')
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('pay-123');
      expect(res.body.data.auditLogs).toBeDefined();
    });
  });

  describe('3. Organization Users API', () => {
    it('GET /api/v1/organization/users - retrieves list of organization users', async () => {
      setTestPermissions(['business.view']);

      mockFindManyUserCustomRole.mockResolvedValue([]);
      
      // Mock raw userBusinessRole query inside organization.service
      const spy = jest.spyOn(require('../../app/lib/prisma').prisma.userBusinessRole, 'findMany').mockResolvedValue([
        {
          role: 'OWNER',
          user: {
            id: 'user-1',
            name: 'Owner User',
            email: 'owner@test.com',
            deletedAt: null,
            customRoles: []
          }
        }
      ]);

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/organization/users')
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].role).toBe('OWNER');
      expect(res.body.data[0].user?.name ?? res.body.data[0].name).toBe('Owner User');
      
      spy.mockRestore();
    });

    it('POST /api/v1/organization/users/invite - creates invited user and audits the invitation', async () => {
      setTestPermissions(['business.manage']);

      // Phase S3: Guard requires an active subscription to allow invites
      mockSubscriptionFindUnique.mockResolvedValue({
        id: 'sub-test',
        businessId: TEST_BIZ_ID,
        status: 'TRIAL',
        planId: 'plan-trial',
        plan: { id: 'plan-trial', code: 'TRIAL', name: 'Trial', isTrial: true, features: [] },
      });

      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        id: 'user-invited-123',
        name: 'Invited User',
        email: 'invitee@test.com',
        businessId: TEST_BIZ_ID,
      });
      mockUserBusinessRoleUpsert.mockResolvedValue({
        role: 'STAFF',
      });
      mockAuditLogCreate.mockResolvedValue({});

      const token = makeToken();
      const res = await request(app)
        .post('/api/v1/organization/users/invite')
        .send({ email: 'invitee@test.com', name: 'Invited User', role: 'STAFF' })
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.id).toBe('user-invited-123');
    });
  });

  describe('4. Custom Roles & Permissions API', () => {
    it('GET /api/v1/roles - lists custom roles along with system roles', async () => {
      setTestPermissions(['business.view']);

      mockFindManyCustomRole.mockResolvedValue([
        { id: 'custom-role-123', name: 'Sales Assistant', permissions: ['product.view', 'order.create'] }
      ]);

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/roles')
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      const customRole = res.body.data.find((r: any) => !r.isSystem);
      expect(customRole.name).toBe('Sales Assistant');
    });

    it('POST /api/v1/roles - creates custom role', async () => {
      setTestPermissions(['business.manage']);

      mockFindFirstCustomRole.mockResolvedValue(null);
      mockCreateCustomRole.mockResolvedValue({
        id: 'custom-role-123',
        name: 'Sales Manager',
        permissions: ['product.view', 'order.create', 'order.delete']
      });

      const token = makeToken();
      const res = await request(app)
        .post('/api/v1/roles')
        .send({ name: 'Sales Manager', description: 'Can manage sales orders', permissions: ['product.view', 'order.create', 'order.delete'] })
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Sales Manager');
    });

    it('GET /api/v1/permissions - returns standard and custom permission metadata catalog', async () => {
      setTestPermissions(['business.view']);

      mockFindManyCustomRole.mockResolvedValue([
        { name: 'Custom Accountant', permissions: ['accounting.view'] }
      ]);

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/permissions')
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.permissions).toBeDefined();
      expect(res.body.data.roleMappings['Custom Accountant']).toEqual(['accounting.view']);
      expect(res.body.data.roleMappings['OWNER']).toBeDefined();
    });
  });

  describe('5. Subscription & Usage API', () => {
    it('GET /api/v1/subscription - retrieves subscription active details, creates Growth Trial if missing', async () => {
      setTestPermissions(['business.view']);

      mockSubscriptionFindUnique.mockResolvedValue(null);
      mockPlanFindUnique.mockResolvedValue({
        id: 'plan-growth-trial',
        code: 'TRIAL',
        name: 'Growth Trial Plan',
        maxUsers: 10,
        maxProducts: 500,
        maxWarehouses: 3,
      });
      mockSubscriptionCreate.mockResolvedValue({
        id: 'sub-new-trial',
        status: 'TRIAL',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        plan: {
          name: 'Growth Trial Plan',
          features: []
        }
      });

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/subscription')
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('sub-new-trial');
      expect(res.body.data.plan.name).toBe('Growth Trial Plan');
    });

    it('GET /api/v1/subscription/usage - retrieves usage metrics and plan limits', async () => {
      setTestPermissions(['business.view']);

      mockSubscriptionFindUnique.mockResolvedValue({
        id: 'sub-active',
        status: 'ACTIVE',
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        plan: {
          name: 'Growth Trial Plan',
          maxUsers: 10,
          maxWarehouses: 3,
          maxProducts: 500,
          features: []
        }
      });

      mockUserBusinessRoleCount.mockResolvedValue(4);
      mockWarehouseCount.mockResolvedValue(2);
      mockItemCount.mockResolvedValue(150);

      const token = makeToken();
      const res = await request(app)
        .get('/api/v1/subscription/usage')
        .set('x-business-id', TEST_BIZ_ID)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics).toEqual([
        { name: 'Users', key: 'users', used: 4, limit: 10, percentage: 40 },
        { name: 'Warehouses', key: 'warehouses', used: 2, limit: 3, percentage: 67 },
        { name: 'Products', key: 'products', used: 150, limit: 500, percentage: 30 }
      ]);
    });
  });
});
