# RBAC Subsystem Inventory

**Status: 🟢 STABLE**
**Frozen as of: 2026-06-06**
**No further backend RBAC refactors unless a security issue is discovered.**

---

## Overview

The backend uses a **tenant-scoped permission model** built on three middleware layers:

| Middleware | File | Role |
|---|---|---|
| `extractAuth` | `rbac.middleware.ts` | Validates JWT, attaches `req.user` + `req.platformRole` |
| `requireTenant` | `tenant.middleware.ts` | Resolves `req.businessId` from the authenticated user |
| `attachBusinessRole` | `rbac.middleware.ts` | Looks up the user's `BusinessRole` (OWNER/MANAGER/STAFF) for that tenant |
| `authorizeAny(...perms)` | `rbac.middleware.ts` | Grants access if the role holds **any** of the listed permissions |

Permissions are stored in DB via `PermissionService` and seeded from `DEFAULT_ROLE_PERMISSIONS` in `src/app/constants/permissions.ts`.

---

## Permission Inventory

**Total unique permission strings: 86**

| Domain | Permissions |
|---|---|
| `product` | `product.view`, `product.create`, `product.update`, `product.delete`, `product.manage` |
| `inventory` | `inventory.view`, `inventory.create`, `inventory.update`, `inventory.delete`, `inventory.manage` |
| `order` | `order.view`, `order.create`, `order.update`, `order.delete`, `order.manage` |
| `customer` | `customer.view`, `customer.create`, `customer.update`, `customer.delete`, `customer.manage` |
| `supplier` | `supplier.view`, `supplier.create`, `supplier.update`, `supplier.delete`, `supplier.manage` |
| `purchase` | `purchase.view`, `purchase.create`, `purchase.update`, `purchase.delete`, `purchase.manage` |
| `accounting` | `accounting.view`, `accounting.create`, `accounting.update`, `accounting.delete`, `accounting.manage` |
| `warehouse` | `warehouse.view`, `warehouse.create`, `warehouse.update`, `warehouse.delete`, `warehouse.manage` |
| `stock-movement` | `stock-movement.view`, `stock-movement.create`, `stock-movement.manage` |
| `report` | `report.view`, `report.manage` |
| `audit` | `audit.view`, `audit.manage` |
| `ai` | `ai.view`, `ai.manage` |
| `brand` | `brand.view`, `brand.create`, `brand.update`, `brand.delete`, `brand.manage` |
| `category` | `category.view`, `category.create`, `category.update`, `category.delete`, `category.manage` |
| `notification` | `notification.view`, `notification.manage` |
| `loyalty` | `loyalty.view`, `loyalty.create`, `loyalty.manage` |
| `review` | `review.view`, `review.create`, `review.delete`, `review.manage` |
| `invoice` | `invoice.view`, `invoice.create`, `invoice.manage` |
| `payment` | `payment.view`, `payment.create`, `payment.manage` |
| `reconciliation` | `reconciliation.view`, `reconciliation.manage` |
| `business` | `business.view`, `business.update`, `business.manage` |
| `upload` | `upload.create` |

---

## Protected Route Inventory

**Total registered routes: ~112**

### Counts by auth strategy

| Strategy | Count |
|---|---|
| `authorizeAny` (permission-based, new RBAC stack) | **46** |
| `auth(Role...)` (legacy role-based stack) | **~56** |
| Public / no auth | **10** |

### Permission-only routes (new RBAC stack) — 46 routes

| Module | Method | Path | Permission(s) |
|---|---|---|---|
| **Products** | GET | `/api/v1/products` | `product.view` |
| | GET | `/api/v1/products/:id` | `product.view` |
| | POST | `/api/v1/products` | `product.create` |
| | PATCH | `/api/v1/products/:id` | `product.update` |
| | DELETE | `/api/v1/products/:id` | `product.delete` |
| **Warehouses** | GET | `/api/v1/warehouses` | `warehouse.view` |
| | GET | `/api/v1/warehouses/:id` | `warehouse.view` |
| | POST | `/api/v1/warehouses` | `warehouse.create` |
| | PATCH | `/api/v1/warehouses/:id` | `warehouse.update` |
| | DELETE | `/api/v1/warehouses/:id` | `warehouse.delete` |
| **Brands** | GET | `/api/v1/brands` | `brand.view` |
| | GET | `/api/v1/brands/:id` | `brand.view` |
| | POST | `/api/v1/brands` | `brand.create` |
| | PATCH | `/api/v1/brands/:id` | `brand.update` |
| | DELETE | `/api/v1/brands/:id` | `brand.delete` |
| **Categories** | GET | `/api/v1/categories` | `category.view` |
| | GET | `/api/v1/categories/:id` | `category.view` |
| | POST | `/api/v1/categories` | `category.create` |
| | PATCH | `/api/v1/categories/:id` | `category.update` |
| | DELETE | `/api/v1/categories/:id` | `category.delete` |
| **Customers** | GET | `/api/v1/customers` | `customer.view` |
| | GET | `/api/v1/customers/:id` | `customer.view` |
| | POST | `/api/v1/customers` | `customer.create` |
| | PATCH | `/api/v1/customers/:id` | `customer.update` |
| | DELETE | `/api/v1/customers/:id` | `customer.delete` |
| **Suppliers** | GET | `/api/v1/suppliers` | `supplier.view` \| `supplier.manage` |
| | GET | `/api/v1/suppliers/:id` | `supplier.view` \| `supplier.manage` |
| | POST | `/api/v1/suppliers` | `supplier.create` \| `supplier.manage` |
| | PATCH | `/api/v1/suppliers/:id` | `supplier.update` \| `supplier.manage` |
| | DELETE | `/api/v1/suppliers/:id` | `supplier.delete` \| `supplier.manage` |
| **Purchases** | GET | `/api/v1/purchases` | `purchase.view` \| `purchase.manage` |
| | GET | `/api/v1/purchases/:id` | `purchase.view` \| `purchase.manage` |
| | POST | `/api/v1/purchases` | `purchase.create` \| `purchase.manage` |
| | POST | `/api/v1/purchases/:id/receive` | `purchase.update` \| `purchase.manage` |
| | POST | `/api/v1/purchases/:id/cancel` | `purchase.update` \| `purchase.manage` |
| | POST | `/api/v1/purchases/:id/pay` | `purchase.update` \| `purchase.manage` |
| **Accounting** | GET | `/api/v1/accounting/reports/trial-balance` | `accounting.view` \| `accounting.manage` |
| | GET | `/api/v1/accounting/reports/profit-loss` | `accounting.view` \| `accounting.manage` |
| | GET | `/api/v1/accounting/reports/balance-sheet` | `accounting.view` \| `accounting.manage` |
| | POST | `/api/v1/accounting/accounts` | `accounting.create` \| `accounting.manage` |
| | GET | `/api/v1/accounting/accounts` | `accounting.view` \| `accounting.manage` |
| | POST | `/api/v1/accounting/journal-entries` | `accounting.create` \| `accounting.manage` |
| | GET | `/api/v1/accounting/ledger` | `accounting.view` \| `accounting.manage` |
| | GET | `/api/v1/accounting/reconciliation` | `reconciliation.view` \| `reconciliation.manage` |
| **Loyalty** | POST | `/api/v1/loyalty/program` | `loyalty.create` \| `loyalty.manage` |
| | GET | `/api/v1/loyalty/customer/:id/balance` | `loyalty.view` \| `loyalty.manage` |

### Legacy `auth(Role...)` routes — ~56 routes (not yet migrated to new RBAC stack)

These routes still use the platform `Role` enum directly. They are functional but bypass the
tenant-scoped permission model. Scheduled for migration in a future workstream.

| Module | Notes |
|---|---|
| `business` | 5 routes — admin/manager/seller role gates |
| `products/batches` | 4 routes — ADMIN/MANAGER/WAREHOUSE_KEEPER |
| `inventory` | 7 routes — ADMIN/MANAGER/WAREHOUSE_KEEPER/SELLER |
| `warehouses/transfers` | 4 routes — ADMIN/MANAGER/WAREHOUSE_KEEPER/SELLER |
| `stock-movements` | 1 route |
| `orders` | 8 routes |
| `invoices` | 5 routes |
| `reviews` | 5 routes |
| `audit` | 1 route |
| `ai` | 3 routes |
| `notifications` | 4 routes (any authenticated user) |
| `reports` | 5 routes |
| `reconciliation` | 6 routes |

### Platform-only routes (public / no tenant)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/auth/register` | Rate-limited |
| POST | `/api/v1/auth/login` | Rate-limited |
| POST | `/api/v1/auth/refresh` | — |
| POST | `/api/v1/auth/logout` | — |
| POST | `/api/v1/auth/oauth-callback` | — |
| GET | `/api/v1/auth/me` | Authenticated, no role restriction |
| GET | `/api/v1/business/public` | Public business directory |
| POST | `/api/v1/payments/initiate` | ⚠️ Unprotected — known gap, out of RBAC scope |
| POST | `/api/v1/payments/webhook/:gateway` | Intentionally public (gateway-signed) |
| POST | `/api/v1/payments/refund` | ⚠️ Unprotected — known gap, out of RBAC scope |
| POST | `/api/v1/uploads/image` | ⚠️ Unprotected — known gap, out of RBAC scope |

> **Note:** The three ⚠️ unprotected routes are known gaps logged separately. They are outside
> the scope of the RBAC freeze and will be addressed as part of the security hardening track.

---

## Known Dead Code

These exist in the codebase but are **not used by any route**:

| Item | Location | Action |
|---|---|---|
| `permission.guard.ts` (`checkPermission`) | `src/app/modules/permissions/` | Delete in cleanup pass |
| `Permission` enum (separate from `PermissionKey`) | `permission.guard.ts` | Delete with above |
| `authorize` alias | `rbac.middleware.ts` | Remove once all routes migrated |

---

## Subsystem Status: STABLE

The RBAC backend subsystem (permissions constants, `rbac.middleware.ts`, `tenant.middleware.ts`,
`DEFAULT_ROLE_PERMISSIONS`, and all `authorizeAny`-gated routes) is **frozen**.

- ✅ 86 permission strings defined and seeded
- ✅ `WAREHOUSE_DELETE` route registered (`DELETE /api/v1/warehouses/:id`)
- ✅ Brand and category validation schemas corrected (`body:` wrapper added)
- ✅ All new-stack routes use `extractAuth → requireTenant → attachBusinessRole → authorizeAny`
- 🔒 No schema changes, no new permissions, no middleware changes without a security justification

---

## Phase 1.4 — Frontend Permission Engine

**Workstream opened: 2026-06-06**

The next phase consumes the stable backend RBAC API from the frontend.

### Goals

1. **Permission context** — fetch and cache the current user's permission set after login
   (`GET /api/v1/auth/me` or a dedicated `/api/v1/permissions/me` endpoint)
2. **`usePermission(permission)` hook** — returns `boolean`; used by every protected UI element
3. **`<PermissionGate permission="..." />` component** — wraps any JSX that should be hidden
   when the user lacks the permission
4. **Route guards** — Next.js middleware (or layout-level) that redirects to `/unauthorized`
   for routes the user's role cannot access
5. **Navigation filtering** — sidebar and nav items filtered by permission set at render time
6. **Optimistic UI** — buttons/actions disabled (not hidden) when permission is absent but
   still visible to convey that the feature exists

### Constraints

- Permission checks are **UI-only** — the backend is the source of truth; frontend checks
  are a UX convenience, not a security boundary
- The permission set must be **re-fetched on role change** (e.g. after a business switch)
- Use the existing `NEXT_PUBLIC_API_URL` env var; no new env vars required
- No new backend endpoints unless the existing `/auth/me` response is insufficient

### Acceptance Criteria

- [ ] `usePermission('warehouse.delete')` returns `false` for a STAFF user
- [ ] `<PermissionGate permission="product.create">` hides the "Add Product" button for STAFF
- [ ] Navigating directly to `/dashboard/warehouses/new` redirects STAFF to `/unauthorized`
- [ ] Permission set is cleared from context on logout
- [ ] No flash of unauthorized content on protected routes
