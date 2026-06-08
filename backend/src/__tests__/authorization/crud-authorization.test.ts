/**
 * Phase 1.3B.2 — CRUD Authorization Validation
 *
 * Validates that permission-based authorization is enforced at runtime for:
 *   Brands · Categories · Products · Customers · Warehouses
 *
 * Roles tested: OWNER · MANAGER · STAFF
 * Operations:   GET (list) · GET (by-id) · POST · PATCH · DELETE
 * Security:     Unauthenticated → 401  |  Cross-tenant → 403
 *
 * How this works
 * ─────────────
 * The real Express app is mounted via supertest. Only the data layer is mocked:
 *   • prisma.userBusinessRole.findUnique  — returns BusinessRole for the user
 *   • PermissionService.getPermissionsForRole — returns keys from DEFAULT_ROLE_PERMISSIONS
 *   • All five service/repository modules — return stub data so the controller
 *     layer does not crash when an authorized request reaches it.
 *
 * Route middleware chain under test:
 *   extractAuth → requireTenant → attachBusinessRole → authorizeAny(<PERM>) → controller
 */

import request from "supertest";
import jwt from "jsonwebtoken";

// ─── Prisma mock (must precede app import) ───────────────────────────────────
const mockFindUniqueUserBizRole = jest.fn();

jest.mock("../../app/lib/prisma", () => ({
  prisma: {
    userBusinessRole: {
      findUnique: (...a: any[]) => mockFindUniqueUserBizRole(...a),
    },
    // Remaining prisma methods are not exercised by the auth chain
    $transaction: jest.fn(),
  },
}));

// ─── PermissionService mock ───────────────────────────────────────────────────
jest.mock("../../app/services/permission.service", () => ({
  PermissionService: {
    getPermissionsForRole: jest.fn(),
  },
}));

// ─── Validation schema mocks ────────────────────────────────────────────────
// brand.validation and category.validation use bare z.object({name}) schemas
// that expect `name` at root, but validateRequest wraps input as
// {body, query, params, cookies}.  Mock the schemas to always pass so
// authorization (not validation) is what we are testing here.
// Note: jest.mock factories are hoisted before imports, so z must be
// required inline rather than referencing the outer import.
jest.mock("../../app/modules/brands/brand.validation", () => {
  const { z } = require("zod");
  return {
    BrandValidation: {
      createBrandSchema: z.object({}).passthrough(),
      updateBrandSchema: z.object({}).passthrough(),
    },
  };
});

jest.mock("../../app/modules/categories/category.validation", () => {
  const { z } = require("zod");
  return {
    CategoryValidation: {
      createCategorySchema: z.object({}).passthrough(),
      updateCategorySchema: z.object({}).passthrough(),
    },
  };
});

// ─── Service / Repository mocks (prevent real DB calls on authorized paths) ──

jest.mock("../../app/modules/brands/brand.service", () => ({
  BrandService: {
    getAllBrands: jest.fn().mockResolvedValue([]),
    getBrandById: jest.fn().mockResolvedValue({ id: "b1", name: "Test Brand" }),
    createBrand: jest.fn().mockResolvedValue({ id: "b1", name: "Test Brand" }),
    updateBrand: jest.fn().mockResolvedValue({ id: "b1", name: "Updated" }),
    deleteBrand: jest.fn().mockResolvedValue({ id: "b1" }),
  },
}));

jest.mock("../../app/modules/categories/category.service", () => ({
  CategoryService: {
    getAllCategories: jest.fn().mockResolvedValue([]),
    getCategoryById: jest
      .fn()
      .mockResolvedValue({ id: "c1", name: "Test Cat" }),
    createCategory: jest.fn().mockResolvedValue({ id: "c1", name: "Test Cat" }),
    updateCategory: jest.fn().mockResolvedValue({ id: "c1", name: "Updated" }),
    deleteCategory: jest.fn().mockResolvedValue({ id: "c1" }),
  },
}));

jest.mock("../../app/modules/products/product.repository", () => ({
  ProductRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../app/modules/inventory/inventory.repository", () => ({
  InventoryRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../app/modules/inventory/inventory.service", () => ({
  InventoryService: jest.fn().mockImplementation(() => ({
    decrementStock: jest.fn(),
    incrementStock: jest.fn(),
  })),
}));

jest.mock("../../app/modules/products/product.service", () => ({
  ProductService: jest.fn().mockImplementation(() => ({
    getAllProducts: jest
      .fn()
      .mockResolvedValue({ items: [], meta: { page: 1, limit: 12, total: 0 } }),
    getProductById: jest
      .fn()
      .mockResolvedValue({ id: "p1", title: "Test Product" }),
    createProduct: jest
      .fn()
      .mockResolvedValue({ id: "p1", title: "Test Product" }),
    updateProduct: jest.fn().mockResolvedValue({ id: "p1", title: "Updated" }),
    deleteProduct: jest.fn().mockResolvedValue({ id: "p1" }),
  })),
}));

jest.mock("../../app/modules/products/batch.service", () => ({
  ProductBatchService: jest.fn().mockImplementation(() => ({
    getAllBatches: jest.fn().mockResolvedValue([]),
    getBatchById: jest.fn().mockResolvedValue({ id: "bt1" }),
    createBatch: jest.fn().mockResolvedValue({ id: "bt1" }),
    deleteBatch: jest.fn().mockResolvedValue({ id: "bt1" }),
  })),
}));

jest.mock("../../app/modules/products/batch.repository", () => ({
  ProductBatchRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../app/modules/customers/customer.repository", () => ({
  CustomerRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../app/modules/customers/customer.service", () => ({
  CustomerService: jest.fn().mockImplementation(() => ({
    getAllCustomers: jest
      .fn()
      .mockResolvedValue({ items: [], meta: { page: 1, limit: 10, total: 0 } }),
    getCustomerById: jest
      .fn()
      .mockResolvedValue({ id: "cu1", name: "Test Customer" }),
    createCustomer: jest
      .fn()
      .mockResolvedValue({ id: "cu1", name: "Test Customer" }),
    updateCustomer: jest.fn().mockResolvedValue({ id: "cu1", name: "Updated" }),
    deleteCustomer: jest.fn().mockResolvedValue({ id: "cu1" }),
  })),
}));

jest.mock("../../app/modules/warehouse/warehouse.repository", () => ({
  WarehouseRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../app/modules/warehouse/warehouse.service", () => ({
  WarehouseService: jest.fn().mockImplementation(() => ({
    getWarehouses: jest.fn().mockResolvedValue([]),
    getWarehouseById: jest
      .fn()
      .mockResolvedValue({ id: "w1", name: "Test WH" }),
    createWarehouse: jest.fn().mockResolvedValue({ id: "w1", name: "Test WH" }),
    updateWarehouse: jest.fn().mockResolvedValue({ id: "w1", name: "Updated" }),
    deleteWarehouse: jest.fn().mockResolvedValue({ id: "w1" }),
  })),
}));

jest.mock("../../app/modules/warehouse/transfer.repository", () => ({
  WarehouseTransferRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../app/modules/warehouse/transfer.service", () => ({
  WarehouseTransferService: {
    getAllTransfers: jest.fn().mockResolvedValue([]),
    getTransferById: jest.fn().mockResolvedValue({ id: "t1" }),
    initiateTransfer: jest.fn().mockResolvedValue({ id: "t1" }),
    updateTransferStatus: jest.fn().mockResolvedValue({ id: "t1" }),
  },
}));

// Accounting service is pulled in by transfer.service at module load time
jest.mock("../../app/modules/accounting/accounting.service", () => ({
  AccountingService: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../app/modules/accounting/accounting.repository", () => ({
  AccountingRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("../../app/modules/audit/audit.service", () => ({
  AuditService: jest.fn().mockImplementation(() => ({})),
}));

// ─── App import (after all mocks are registered) ────────────────────────────
// We build a MINIMAL test app (not the full app.ts) to avoid loading
// auth.service.ts transitively, which carries a pre-existing TS type error.
import express from "express";
import cookieParser from "cookie-parser";
import { extractAuth } from "../../app/middleware/rbac.middleware";
import globalErrorHandler from "../../app/middleware/error.middleware";
import { BrandRoutes } from "../../app/modules/brands/brand.routes";
import { CategoryRoutes } from "../../app/modules/categories/category.routes";
import { ProductRoutes } from "../../app/modules/products/product.routes";
import { CustomerRoutes } from "../../app/modules/customers/customer.routes";
import { WarehouseRoutes } from "../../app/modules/warehouse/warehouse.routes";
import { PermissionService } from "../../app/services/permission.service";
import { env } from "../../config/env";

const app = express();
app.use(express.json());
app.use(cookieParser());
// Mirror the global extractAuth applied in app.ts
app.use(extractAuth);
app.use("/api/v1/brands", BrandRoutes);
app.use("/api/v1/categories", CategoryRoutes);
app.use("/api/v1/products", ProductRoutes);
app.use("/api/v1/customers", CustomerRoutes);
app.use("/api/v1/warehouses", WarehouseRoutes);
app.use(globalErrorHandler);

// ─── Constants ───────────────────────────────────────────────────────────────

// Use the runtime JWT secret so extractAuth can verify tokens we sign here.
// env.jwtSecret may come from .env (real secret) or the test fallback — both work.
const JWT_SECRET = env.jwtSecret;
const TEST_BIZ_ID = "biz-test-0000-1111";
const OTHER_BIZ_ID = "biz-other-9999-8888";

/**
 * Permissions granted to each business role.
 * Mirrors DEFAULT_ROLE_PERMISSIONS in src/app/constants/permissions.ts.
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: [
    "product.view",
    "product.create",
    "product.update",
    "product.delete",
    "product.manage",
    "inventory.view",
    "inventory.create",
    "inventory.update",
    "inventory.delete",
    "inventory.manage",
    "order.view",
    "order.create",
    "order.update",
    "order.delete",
    "order.manage",
    "customer.view",
    "customer.create",
    "customer.update",
    "customer.delete",
    "customer.manage",
    "supplier.view",
    "supplier.create",
    "supplier.update",
    "supplier.delete",
    "supplier.manage",
    "purchase.view",
    "purchase.create",
    "purchase.update",
    "purchase.delete",
    "purchase.manage",
    "accounting.view",
    "accounting.create",
    "accounting.update",
    "accounting.delete",
    "accounting.manage",
    "warehouse.view",
    "warehouse.create",
    "warehouse.update",
    "warehouse.delete",
    "warehouse.manage",
    "stock-movement.view",
    "stock-movement.create",
    "stock-movement.manage",
    "report.view",
    "report.manage",
    "audit.view",
    "audit.manage",
    "ai.view",
    "ai.manage",
    "brand.view",
    "brand.create",
    "brand.update",
    "brand.delete",
    "brand.manage",
    "category.view",
    "category.create",
    "category.update",
    "category.delete",
    "category.manage",
    "notification.view",
    "notification.manage",
    "loyalty.view",
    "loyalty.create",
    "loyalty.manage",
    "review.view",
    "review.create",
    "review.delete",
    "review.manage",
    "invoice.view",
    "invoice.create",
    "invoice.manage",
    "payment.view",
    "payment.create",
    "payment.manage",
    "reconciliation.view",
    "reconciliation.manage",
    "business.view",
    "business.update",
    "business.manage",
    "upload.create",
  ],
  MANAGER: [
    "product.view",
    "product.create",
    "product.update",
    "product.delete",
    "inventory.view",
    "inventory.create",
    "inventory.update",
    "order.view",
    "order.create",
    "order.update",
    "customer.view",
    "customer.create",
    "customer.update",
    "supplier.view",
    "supplier.create",
    "supplier.update",
    "purchase.view",
    "purchase.create",
    "purchase.update",
    "accounting.view",
    "accounting.create",
    "warehouse.view",
    "warehouse.create",
    "warehouse.update",
    "stock-movement.view",
    "stock-movement.create",
    "report.view",
    "brand.view",
    "brand.create",
    "brand.update",
    "category.view",
    "category.create",
    "category.update",
    "invoice.view",
    "invoice.create",
    "payment.view",
    "payment.create",
    "loyalty.view",
    "loyalty.create",
    "notification.view",
    "ai.view",
    "review.view",
    "review.delete",
    "upload.create",
  ],
  STAFF: [
    "product.view",
    "inventory.view",
    "order.view",
    "order.create",
    "customer.view",
    "customer.create",
    "warehouse.view",
    "stock-movement.view",
    "brand.view",
    "category.view",
    "invoice.view",
    "payment.view",
    "payment.create",
    "notification.view",
    "loyalty.view",
    "review.view",
    "review.create",
    "upload.create",
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeToken(businessId: string = TEST_BIZ_ID): string {
  return jwt.sign(
    {
      sub: "user-id-test",
      role: "USER",
      email: "test@agriqon.test",
      businessId,
    },
    JWT_SECRET,
    { algorithm: "HS256" },
  );
}

/** Simulate a user with the given business role for TEST_BIZ_ID. */
function asRole(role: "OWNER" | "MANAGER" | "STAFF") {
  mockFindUniqueUserBizRole.mockResolvedValue({ role });
  (PermissionService.getPermissionsForRole as jest.Mock).mockImplementation(
    (r: string) => Promise.resolve(ROLE_PERMISSIONS[r] ?? []),
  );
}

/** Simulate a user that has NO role in this business (cross-tenant). */
function asCrossTenant() {
  mockFindUniqueUserBizRole.mockResolvedValue(null); // no UserBusinessRole found
  (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue([]);
}

type Method = "get" | "post" | "patch" | "delete";

interface RequestOptions {
  token?: string; // omit to test unauthenticated
  businessId?: string; // defaults to TEST_BIZ_ID
  body?: Record<string, unknown>;
}

async function hit(
  method: Method,
  path: string,
  opts: RequestOptions = {},
): Promise<number> {
  const bizId = opts.businessId ?? TEST_BIZ_ID;
  let req = (request(app) as any)[method](path).set("x-business-id", bizId);

  if (opts.token !== undefined) {
    req = req.set("Authorization", `Bearer ${opts.token}`);
  }
  if (opts.body) {
    req = req.send(opts.body);
  }

  const res = await req;
  return res.status;
}

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const STUB_ID = "00000000-0000-0000-0000-000000000001";
const STUB_CAT = "00000000-0000-0000-0000-000000000002";

const VALID_BRAND = { name: "AgroFresh" };
const VALID_CATEGORY = { name: "Vegetables" };
const VALID_PRODUCT = {
  title: "Tomatoes",
  categoryId: STUB_CAT,
  price: 5.99,
  unit: "kg",
  initialStock: 100,
};
const VALID_CUSTOMER = { name: "Farmer Joe", email: "joe@farm.com" };
const VALID_WAREHOUSE = { name: "Main Store", location: "Nairobi" };

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ══════════════════════════════════════════════════════════════════════════════
//  BRANDS
// ══════════════════════════════════════════════════════════════════════════════

describe("Brands Authorization", () => {
  const token = makeToken();

  describe("GET /api/v1/brands  [brand.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", "/api/v1/brands", { token })).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", "/api/v1/brands", { token })).toBe(200);
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", "/api/v1/brands", { token })).toBe(200);
    });
  });

  describe("GET /api/v1/brands/:id  [brand.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", `/api/v1/brands/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", `/api/v1/brands/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", `/api/v1/brands/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
  });

  describe("POST /api/v1/brands  [brand.create]", () => {
    it("OWNER → 201", async () => {
      asRole("OWNER");
      expect(
        await hit("post", "/api/v1/brands", { token, body: VALID_BRAND }),
      ).toBe(201);
    });
    it("MANAGER → 201", async () => {
      asRole("MANAGER");
      expect(
        await hit("post", "/api/v1/brands", { token, body: VALID_BRAND }),
      ).toBe(201);
    });
    it("STAFF → 403  (no brand.create)", async () => {
      asRole("STAFF");
      expect(
        await hit("post", "/api/v1/brands", { token, body: VALID_BRAND }),
      ).toBe(403);
    });
  });

  describe("PATCH /api/v1/brands/:id  [brand.update]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(
        await hit("patch", `/api/v1/brands/${STUB_ID}`, {
          token,
          body: VALID_BRAND,
        }),
      ).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(
        await hit("patch", `/api/v1/brands/${STUB_ID}`, {
          token,
          body: VALID_BRAND,
        }),
      ).toBe(200);
    });
    it("STAFF → 403  (no brand.update)", async () => {
      asRole("STAFF");
      expect(
        await hit("patch", `/api/v1/brands/${STUB_ID}`, {
          token,
          body: VALID_BRAND,
        }),
      ).toBe(403);
    });
  });

  describe("DELETE /api/v1/brands/:id  [brand.delete]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("delete", `/api/v1/brands/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("MANAGER → 403  (brand.delete absent from MANAGER role)", async () => {
      asRole("MANAGER");
      expect(await hit("delete", `/api/v1/brands/${STUB_ID}`, { token })).toBe(
        403,
      );
    });
    it("STAFF → 403  (no brand.delete)", async () => {
      asRole("STAFF");
      expect(await hit("delete", `/api/v1/brands/${STUB_ID}`, { token })).toBe(
        403,
      );
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  CATEGORIES
// ══════════════════════════════════════════════════════════════════════════════

describe("Categories Authorization", () => {
  const token = makeToken();

  describe("GET /api/v1/categories  [category.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", "/api/v1/categories", { token })).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", "/api/v1/categories", { token })).toBe(200);
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", "/api/v1/categories", { token })).toBe(200);
    });
  });

  describe("GET /api/v1/categories/:id  [category.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", `/api/v1/categories/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", `/api/v1/categories/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", `/api/v1/categories/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
  });

  describe("POST /api/v1/categories  [category.create]", () => {
    it("OWNER → 201", async () => {
      asRole("OWNER");
      expect(
        await hit("post", "/api/v1/categories", {
          token,
          body: VALID_CATEGORY,
        }),
      ).toBe(201);
    });
    it("MANAGER → 201", async () => {
      asRole("MANAGER");
      expect(
        await hit("post", "/api/v1/categories", {
          token,
          body: VALID_CATEGORY,
        }),
      ).toBe(201);
    });
    it("STAFF → 403  (no category.create)", async () => {
      asRole("STAFF");
      expect(
        await hit("post", "/api/v1/categories", {
          token,
          body: VALID_CATEGORY,
        }),
      ).toBe(403);
    });
  });

  describe("PATCH /api/v1/categories/:id  [category.update]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(
        await hit("patch", `/api/v1/categories/${STUB_ID}`, {
          token,
          body: VALID_CATEGORY,
        }),
      ).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(
        await hit("patch", `/api/v1/categories/${STUB_ID}`, {
          token,
          body: VALID_CATEGORY,
        }),
      ).toBe(200);
    });
    it("STAFF → 403  (no category.update)", async () => {
      asRole("STAFF");
      expect(
        await hit("patch", `/api/v1/categories/${STUB_ID}`, {
          token,
          body: VALID_CATEGORY,
        }),
      ).toBe(403);
    });
  });

  describe("DELETE /api/v1/categories/:id  [category.delete]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(
        await hit("delete", `/api/v1/categories/${STUB_ID}`, { token }),
      ).toBe(200);
    });
    it("MANAGER → 403  (category.delete absent from MANAGER)", async () => {
      asRole("MANAGER");
      expect(
        await hit("delete", `/api/v1/categories/${STUB_ID}`, { token }),
      ).toBe(403);
    });
    it("STAFF → 403  (no category.delete)", async () => {
      asRole("STAFF");
      expect(
        await hit("delete", `/api/v1/categories/${STUB_ID}`, { token }),
      ).toBe(403);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════════════════════════════════════════

describe("Products Authorization", () => {
  const token = makeToken();

  describe("GET /api/v1/products  [product.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", "/api/v1/products", { token })).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", "/api/v1/products", { token })).toBe(200);
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", "/api/v1/products", { token })).toBe(200);
    });
  });

  describe("GET /api/v1/products/:id  [product.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", `/api/v1/products/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", `/api/v1/products/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", `/api/v1/products/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
  });

  describe("POST /api/v1/products  [product.create]", () => {
    it("OWNER → 201", async () => {
      asRole("OWNER");
      expect(
        await hit("post", "/api/v1/products", { token, body: VALID_PRODUCT }),
      ).toBe(201);
    });
    it("MANAGER → 201", async () => {
      asRole("MANAGER");
      expect(
        await hit("post", "/api/v1/products", { token, body: VALID_PRODUCT }),
      ).toBe(201);
    });
    it("STAFF → 403  (no product.create)", async () => {
      asRole("STAFF");
      expect(
        await hit("post", "/api/v1/products", { token, body: VALID_PRODUCT }),
      ).toBe(403);
    });
  });

  describe("PATCH /api/v1/products/:id  [product.update]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(
        await hit("patch", `/api/v1/products/${STUB_ID}`, {
          token,
          body: { title: "Updated" },
        }),
      ).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(
        await hit("patch", `/api/v1/products/${STUB_ID}`, {
          token,
          body: { title: "Updated" },
        }),
      ).toBe(200);
    });
    it("STAFF → 403  (no product.update)", async () => {
      asRole("STAFF");
      expect(
        await hit("patch", `/api/v1/products/${STUB_ID}`, {
          token,
          body: { title: "Updated" },
        }),
      ).toBe(403);
    });
  });

  describe("DELETE /api/v1/products/:id  [product.delete]", () => {
    /**
     * MANAGER has product.delete in DEFAULT_ROLE_PERMISSIONS.
     * So delete is allowed for MANAGER — this is intentional design.
     */
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(
        await hit("delete", `/api/v1/products/${STUB_ID}`, { token }),
      ).toBe(200);
    });
    it("MANAGER → 200  (product.delete granted to MANAGER)", async () => {
      asRole("MANAGER");
      expect(
        await hit("delete", `/api/v1/products/${STUB_ID}`, { token }),
      ).toBe(200);
    });
    it("STAFF → 403  (no product.delete)", async () => {
      asRole("STAFF");
      expect(
        await hit("delete", `/api/v1/products/${STUB_ID}`, { token }),
      ).toBe(403);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  CUSTOMERS
// ══════════════════════════════════════════════════════════════════════════════

describe("Customers Authorization", () => {
  const token = makeToken();

  describe("GET /api/v1/customers  [customer.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", "/api/v1/customers", { token })).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", "/api/v1/customers", { token })).toBe(200);
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", "/api/v1/customers", { token })).toBe(200);
    });
  });

  describe("GET /api/v1/customers/:id  [customer.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", `/api/v1/customers/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", `/api/v1/customers/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", `/api/v1/customers/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
  });

  describe("POST /api/v1/customers  [customer.create]", () => {
    /**
     * STAFF has customer.create — day-to-day POS workflow requires it.
     */
    it("OWNER → 201", async () => {
      asRole("OWNER");
      expect(
        await hit("post", "/api/v1/customers", { token, body: VALID_CUSTOMER }),
      ).toBe(201);
    });
    it("MANAGER → 201", async () => {
      asRole("MANAGER");
      expect(
        await hit("post", "/api/v1/customers", { token, body: VALID_CUSTOMER }),
      ).toBe(201);
    });
    it("STAFF → 201  (customer.create granted to STAFF)", async () => {
      asRole("STAFF");
      expect(
        await hit("post", "/api/v1/customers", { token, body: VALID_CUSTOMER }),
      ).toBe(201);
    });
  });

  describe("PATCH /api/v1/customers/:id  [customer.update]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(
        await hit("patch", `/api/v1/customers/${STUB_ID}`, {
          token,
          body: { name: "Updated" },
        }),
      ).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(
        await hit("patch", `/api/v1/customers/${STUB_ID}`, {
          token,
          body: { name: "Updated" },
        }),
      ).toBe(200);
    });
    it("STAFF → 403  (no customer.update)", async () => {
      asRole("STAFF");
      expect(
        await hit("patch", `/api/v1/customers/${STUB_ID}`, {
          token,
          body: { name: "Updated" },
        }),
      ).toBe(403);
    });
  });

  describe("DELETE /api/v1/customers/:id  [customer.delete]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(
        await hit("delete", `/api/v1/customers/${STUB_ID}`, { token }),
      ).toBe(200);
    });
    it("MANAGER → 403  (customer.delete absent from MANAGER)", async () => {
      asRole("MANAGER");
      expect(
        await hit("delete", `/api/v1/customers/${STUB_ID}`, { token }),
      ).toBe(403);
    });
    it("STAFF → 403  (no customer.delete)", async () => {
      asRole("STAFF");
      expect(
        await hit("delete", `/api/v1/customers/${STUB_ID}`, { token }),
      ).toBe(403);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  WAREHOUSES
// ══════════════════════════════════════════════════════════════════════════════

describe("Warehouses Authorization", () => {
  const token = makeToken();

  describe("GET /api/v1/warehouses  [warehouse.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", "/api/v1/warehouses", { token })).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", "/api/v1/warehouses", { token })).toBe(200);
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", "/api/v1/warehouses", { token })).toBe(200);
    });
  });

  describe("GET /api/v1/warehouses/:id  [warehouse.view]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(await hit("get", `/api/v1/warehouses/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(await hit("get", `/api/v1/warehouses/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
    it("STAFF → 200", async () => {
      asRole("STAFF");
      expect(await hit("get", `/api/v1/warehouses/${STUB_ID}`, { token })).toBe(
        200,
      );
    });
  });

  describe("POST /api/v1/warehouses  [warehouse.create]", () => {
    it("OWNER → 201", async () => {
      asRole("OWNER");
      expect(
        await hit("post", "/api/v1/warehouses", {
          token,
          body: VALID_WAREHOUSE,
        }),
      ).toBe(201);
    });
    it("MANAGER → 201", async () => {
      asRole("MANAGER");
      expect(
        await hit("post", "/api/v1/warehouses", {
          token,
          body: VALID_WAREHOUSE,
        }),
      ).toBe(201);
    });
    it("STAFF → 403  (no warehouse.create)", async () => {
      asRole("STAFF");
      expect(
        await hit("post", "/api/v1/warehouses", {
          token,
          body: VALID_WAREHOUSE,
        }),
      ).toBe(403);
    });
  });

  describe("PATCH /api/v1/warehouses/:id  [warehouse.update]", () => {
    it("OWNER → 200", async () => {
      asRole("OWNER");
      expect(
        await hit("patch", `/api/v1/warehouses/${STUB_ID}`, {
          token,
          body: { name: "Updated" },
        }),
      ).toBe(200);
    });
    it("MANAGER → 200", async () => {
      asRole("MANAGER");
      expect(
        await hit("patch", `/api/v1/warehouses/${STUB_ID}`, {
          token,
          body: { name: "Updated" },
        }),
      ).toBe(200);
    });
    it("STAFF → 403  (no warehouse.update)", async () => {
      asRole("STAFF");
      expect(
        await hit("patch", `/api/v1/warehouses/${STUB_ID}`, {
          token,
          body: { name: "Updated" },
        }),
      ).toBe(403);
    });
  });

  describe("DELETE /api/v1/warehouses/:id  [warehouse.delete]", () => {
    /**
     * Route registered in Phase 1.3B. Requires warehouse.delete permission.
     * OWNER → 200/404 (has permission; 404 because stub ID doesn't exist in test DB)
     * MANAGER → 403 (lacks warehouse.delete; has warehouse.manage only)
     * STAFF → 403 (no warehouse permissions)
     */
    it("OWNER → 200  (has permission; service mocked)", async () => {
      asRole("OWNER");
      expect(
        await hit("delete", `/api/v1/warehouses/${STUB_ID}`, { token }),
      ).toBe(200);
    });
    it("MANAGER → 403  (lacks warehouse.delete)", async () => {
      asRole("MANAGER");
      expect(
        await hit("delete", `/api/v1/warehouses/${STUB_ID}`, { token }),
      ).toBe(403);
    });
    it("STAFF → 403  (no warehouse permissions)", async () => {
      asRole("STAFF");
      expect(
        await hit("delete", `/api/v1/warehouses/${STUB_ID}`, { token }),
      ).toBe(403);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  SECURITY — Unauthenticated & Cross-Tenant
// ══════════════════════════════════════════════════════════════════════════════

describe("Security: Unauthenticated (no token)", () => {
  const endpoints: Array<[Method, string]> = [
    ["get", "/api/v1/brands"],
    ["post", "/api/v1/brands"],
    ["get", "/api/v1/categories"],
    ["post", "/api/v1/categories"],
    ["get", "/api/v1/products"],
    ["post", "/api/v1/products"],
    ["get", "/api/v1/customers"],
    ["post", "/api/v1/customers"],
    ["get", "/api/v1/warehouses"],
    ["post", "/api/v1/warehouses"],
  ];

  it.each(endpoints)("%s %s → 401", async (method, path) => {
    mockFindUniqueUserBizRole.mockResolvedValue(null);
    // No token provided → no req.user → requireAuth gate fires
    expect(await hit(method, path)).toBe(401);
  });
});

describe("Security: Cross-Tenant (valid token, wrong business)", () => {
  /**
   * User token carries businessId = TEST_BIZ_ID.
   * Request header sends x-business-id = OTHER_BIZ_ID.
   * attachBusinessRole looks up (userId, OTHER_BIZ_ID) → null.
   * authorizeAny → 403 "No business role assigned."
   */
  const token = makeToken(TEST_BIZ_ID); // JWT is for TEST_BIZ_ID

  const endpoints: Array<[Method, string]> = [
    ["get", "/api/v1/brands"],
    ["get", "/api/v1/categories"],
    ["get", "/api/v1/products"],
    ["get", "/api/v1/customers"],
    ["get", "/api/v1/warehouses"],
  ];

  it.each(endpoints)(
    "%s %s with foreign businessId → 403",
    async (method, path) => {
      asCrossTenant();
      expect(await hit(method, path, { token, businessId: OTHER_BIZ_ID })).toBe(
        403,
      );
    },
  );
});

// ══════════════════════════════════════════════════════════════════════════════
//  PERMISSION SOURCE VERIFICATION
// ══════════════════════════════════════════════════════════════════════════════

describe("Permission Source Verification", () => {
  /**
   * Proves that authorizeAny resolves permissions through:
   *   UserBusinessRole → RolePermission → Permission
   * rather than hardcoded role enum comparisons.
   *
   * Mechanism: we give STAFF the permission 'brand.create' in the mock
   * (normally absent), and confirm the request succeeds. Then we remove it
   * and confirm it fails again. Role enum is never inspected.
   */
  const token = makeToken();

  it("grants access when PermissionService returns the required key — regardless of role name", async () => {
    mockFindUniqueUserBizRole.mockResolvedValue({ role: "STAFF" });
    // Inject brand.create into STAFF's permission list (normally absent)
    (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue([
      "brand.view",
      "brand.create", // injected
    ]);

    const status = await hit("post", "/api/v1/brands", {
      token,
      body: VALID_BRAND,
    });
    expect(status).toBe(201);
  });

  it("denies access when PermissionService omits the required key — regardless of role name", async () => {
    mockFindUniqueUserBizRole.mockResolvedValue({ role: "OWNER" });
    // Strip brand.create from OWNER's permission list
    (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue([
      "brand.view",
      // brand.create intentionally omitted
    ]);

    const status = await hit("post", "/api/v1/brands", {
      token,
      body: VALID_BRAND,
    });
    expect(status).toBe(403);
  });

  it("authorizeAny calls PermissionService.getPermissionsForRole — not a hardcoded role check", async () => {
    asRole("OWNER");
    await hit("get", "/api/v1/brands", { token });

    expect(PermissionService.getPermissionsForRole).toHaveBeenCalledWith(
      "OWNER",
    );
    expect(PermissionService.getPermissionsForRole).not.toHaveBeenCalledWith(
      expect.not.stringMatching(/^(OWNER|MANAGER|STAFF)$/),
    );
  });
});
