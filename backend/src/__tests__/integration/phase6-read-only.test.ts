import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { extractAuth } from '../../app/middleware/rbac.middleware';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { ProductRoutes } from '../../app/modules/products/product.routes';
import { OrganizationRoutes } from '../../app/modules/organization/organization.routes';
import { WarehouseRoutes } from '../../app/modules/warehouse/warehouse.routes';
import { OrderRoutes } from '../../app/modules/orders/order.routes';
import { InvoiceRoutes } from '../../app/modules/invoices/invoice.routes';
import { PaymentRoutes } from '../../app/modules/payments/payment.routes';
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
const mockItemFindMany = jest.fn();
const mockUserFindMany = jest.fn();
const mockUserRoleCount = jest.fn();
const mockWarehouseCount = jest.fn();
const mockWarehouseFindMany = jest.fn();
const mockOrderFindUnique = jest.fn();
const mockOrderFindMany = jest.fn();
const mockInvoiceFindMany = jest.fn();
const mockInvoiceFindFirst = jest.fn();
const mockInvoiceCount = jest.fn();
const mockPaymentFindMany = jest.fn();
const mockAuditLogCreate = jest.fn();
const mockOutboxEventCreate = jest.fn();

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
      findMany: (...a: any[]) => mockItemFindMany(...a),
    },
    userBusinessRoleList: {
      findMany: (...a: any[]) => mockUserFindMany(...a),
    },
    warehouse: {
      count: (...a: any[]) => mockWarehouseCount(...a),
      findMany: (...a: any[]) => mockWarehouseFindMany(...a),
    },
    order: {
      findUnique: (...a: any[]) => mockOrderFindUnique(...a),
      findMany: (...a: any[]) => mockOrderFindMany(...a),
    },
    invoice: {
      findMany: (...a: any[]) => mockInvoiceFindMany(...a),
      findFirst: (...a: any[]) => mockInvoiceFindFirst(...a),
      count: (...a: any[]) => mockInvoiceCount(...a),
    },
    payment: {
      findMany: (...a: any[]) => mockPaymentFindMany(...a),
    },
    auditLog: {
      create: (...a: any[]) => mockAuditLogCreate(...a),
    },
    outboxEvent: {
      create: (...a: any[]) => mockOutboxEventCreate(...a),
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


describe('Phase S6 — Grace Period & Read-Only Mode Integration Tests', () => {
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

  function mockSubscription(status: SubscriptionStatus) {
    mockSubscriptionFindUnique.mockResolvedValue({
      id: 'sub-1',
      businessId: 'biz-1',
      planId: 'plan-1',
      status,
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
          { id: 'f-1', planId: 'plan-1', featureKey: 'ACCOUNTING', value: 'true' }
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

    app.use('/api/v1/products', ProductRoutes);
    app.use('/api/v1/organization', OrganizationRoutes);
    app.use('/api/v1/warehouses', WarehouseRoutes);
    app.use('/api/v1/orders', OrderRoutes);
    app.use('/api/v1/invoices', InvoiceRoutes);
    app.use('/api/v1/payments', PaymentRoutes);

    app.use(globalErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mutations blocked in GRACE_PERIOD status', () => {
    beforeEach(() => {
      mockSubscription(SubscriptionStatus.GRACE_PERIOD);
    });

    it('blocks Product Creation (returns 403 BUSINESS_READ_ONLY)', async () => {
      setTestPermissions(['product.create']);
      const res = await request(app)
        .post('/api/v1/products')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Fertilizer',
          price: 50.0,
          categoryId: 'c1111111-1111-1111-1111-111111111111'
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('BUSINESS_READ_ONLY');
      expect(res.body.subscriptionStatus).toBe(SubscriptionStatus.GRACE_PERIOD);
    });

    it('blocks User Invitation (returns 403 BUSINESS_READ_ONLY)', async () => {
      setTestPermissions(['business.manage']);
      const res = await request(app)
        .post('/api/v1/organization/users/invite')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bob', email: 'bob@example.com', role: 'STAFF' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('BUSINESS_READ_ONLY');
    });

    it('blocks Warehouse Creation (returns 403)', async () => {
      setTestPermissions(['warehouse.create']);
      const res = await request(app)
        .post('/api/v1/warehouses')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Storage 2' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('BUSINESS_READ_ONLY');
    });

    it('blocks Order Creation (returns 403)', async () => {
      setTestPermissions(['order.create']);
      const res = await request(app)
        .post('/api/v1/orders')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            {
              itemId: 'i1111111-1111-1111-1111-111111111111',
              warehouseId: 'w1111111-1111-1111-1111-111111111111',
              quantity: 2,
              unitPrice: 10
            }
          ],
          idempotencyKey: 'a1111111-1111-1111-1111-111111111111'
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('BUSINESS_READ_ONLY');
    });

    it('blocks Payment Initiation (returns 403)', async () => {
      setTestPermissions(['payment.create']);
      const res = await request(app)
        .post('/api/v1/payments/initiate')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 100, currency: 'USD', gateway: 'STRIPE', invoiceId: 'order-123' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('BUSINESS_READ_ONLY');
    });
  });

  describe('Reads allowed in GRACE_PERIOD status', () => {
    beforeEach(() => {
      mockSubscription(SubscriptionStatus.GRACE_PERIOD);
    });

    it('allows Product List retrieval', async () => {
      setTestPermissions(['product.view']);
      mockItemFindMany.mockResolvedValue([]);
      mockItemCount.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/products')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('allows Invoices List retrieval', async () => {
      setTestPermissions(['invoice.view']);
      mockInvoiceFindMany.mockResolvedValue([]);
      mockInvoiceCount.mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/invoices')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Mutations allowed in ACTIVE status', () => {
    beforeEach(() => {
      mockSubscription(SubscriptionStatus.ACTIVE);
    });

    it('allows Product Creation', async () => {
      setTestPermissions(['product.create']);
      mockItemCount.mockResolvedValue(0);
      mockUserRoleCount.mockResolvedValue(0);
      mockWarehouseCount.mockResolvedValue(0);
      
      // We return mock resolved value for create
      const localMockPrisma = jest.requireMock('../../app/lib/prisma').prisma;
      localMockPrisma.item.create = jest.fn().mockResolvedValue({
        id: 'prod-123',
        title: 'Fertilizer',
        price: 50.0,
        businessId: 'biz-1'
      });
      localMockPrisma.outboxEvent.create = jest.fn().mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/products')
        .set('x-business-id', 'biz-1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Fertilizer',
          price: 50.0,
          categoryId: 'c1111111-1111-1111-1111-111111111111'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
