# AgriQon API Documentation

Welcome to the **AgriQon** Backend API Documentation. This API is built with Express, TypeScript, and Prisma, following a modular architecture.

## Table of Contents
- [Base Configuration](#base-configuration)
- [Authentication & Security](#authentication--security)
- [Core Modules](#core-modules)
  - [Auth](#auth)
  - [Business](#business)
  - [Products](#products)
  - [Inventory & Warehouses](#inventory--warehouses)
  - [Orders & Invoices](#orders--invoices)
- [Operational Modules](#operational-modules)
  - [Customers](#customers)
  - [Suppliers & Purchases](#suppliers--purchases)
  - [Loyalty & Reviews](#loyalty--reviews)
- [System & Advanced Modules](#system--advanced-modules)
  - [AI & Analytics](#ai--analytics)
  - [Reports & Audit](#reports--audit)
  - [Uploads](#uploads)

---

## Base Configuration

- **Base URL**: `http://localhost:5000/api/v1` (Default development)
- **Content Type**: `application/json`
- **Rate Limiting**: Auth endpoints are restricted via `authLimiter`. General API routes have standard rate limits.

---

## Authentication & Security

Most endpoints require a **Bearer Token** in the `Authorization` header.

```http
Authorization: Bearer <your_jwt_token>
```

### Roles Supported:
- `ADMIN`
- `MANAGER`
- `SELLER`
- `CASHIER`
- `ACCOUNTANT`
- `WAREHOUSE_KEEPER`

---

## Core Modules

### Auth
Handles user registration, login, and session management.

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | Register a new user | No (Rate limited) |
| POST | `/auth/login` | Authenticate and get tokens | No (Rate limited) |
| POST | `/auth/refresh` | Get a new access token using refresh token | No |
| POST | `/auth/logout` | Invalidate current session | Yes |

### Business
Manage business profiles and organizations.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| GET | `/business` | Get all businesses | ADMIN |
| GET | `/business/me` | Get current user's business | Any |
| POST | `/business` | Create a new business profile | ADMIN, MANAGER |
| PATCH | `/business/:id` | Update business details | ADMIN, MANAGER |

### Products
Manage catalog items, categories, and brands.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| GET | `/products` | List all products | Public/Any |
| POST | `/products` | Create a new product | ADMIN, MANAGER, SELLER |
| GET | `/products/:id` | Get product details | Public/Any |
| PATCH | `/products/:id` | Update product | ADMIN, MANAGER, SELLER |
| DELETE | `/products/:id` | Soft delete product | ADMIN, MANAGER |
| GET | `/categories` | List categories | Any |
| GET | `/brands` | List brands | Any |

### Inventory & Warehouses
Track stock levels and movements across locations.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| GET | `/inventory` | View stock levels | Any staff |
| POST | `/inventory/adjust` | Manual stock adjustment | MANAGER, WAREHOUSE_KEEPER |
| GET | `/warehouses` | List warehouses | Any staff |
| POST | `/stock-movements` | Record a stock transfer | MANAGER, WAREHOUSE_KEEPER |

### Orders & Invoices
Sales processing and billing.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| POST | `/orders` | Create a new order | ADMIN, MANAGER, CASHIER |
| GET | `/orders` | List orders (with filters) | Any staff |
| GET | `/orders/:id` | Get order details | Any staff |
| PATCH | `/orders/:id/status`| Update order status | ADMIN, MANAGER |
| POST | `/invoices/:id/pay` | Record invoice payment | ADMIN, ACCOUNTANT |

---

## Operational Modules

### Customers
CRM features for managing buyer information.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| GET | `/customers` | List all customers | Any staff |
| POST | `/customers` | Register a customer | Any staff |
| GET | `/customers/:id` | View customer profile & history | Any staff |

### Loyalty & Reviews
Customer engagement features.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| GET | `/loyalty/:customerId`| Check loyalty points | Any staff |
| GET | `/reviews/product/:id`| Get product reviews | Public |
| POST | `/reviews` | Submit a review | Customer (Auth) |

---

## System & Advanced Modules

### AI & Analytics
Advanced features powered by LLMs and Data Processing.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| POST | `/ai/analyze-stock` | Get AI insights on stock levels | ADMIN, MANAGER |
| POST | `/ai/sales-forecast` | Get predicted sales trends | ADMIN, MANAGER |
| GET | `/reports/dashboard` | Get high-level analytics summary| ADMIN, MANAGER |

### Audit & Logs
System transparency and tracking.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| GET | `/audit` | View system audit logs | ADMIN |
| GET | `/audit/:id` | Detailed audit record | ADMIN |

### Uploads
File and image management.

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| POST | `/uploads` | Upload an image (Multer based) | Any staff |
| DELETE | `/uploads/:id` | Remove an uploaded file | ADMIN, MANAGER |

---

## Error Handling

The API uses standard HTTP status codes:
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error (Zod)
- `401 Unauthorized`: Authentication missing/invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Something went wrong on our end

### Error Response Format:
```json
{
  "success": false,
  "message": "Error description here",
  "errorSources": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ],
  "stack": "..." (only in development)
}
```

---

## Phase 2.2 — Extended Module APIs

### Dashboard & Analytics
Provides business analytics and performance tracking.

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| GET | `/dashboard/summary` | Get high-level summary (Revenue, Orders Count, Customers Count, Inventory Value, Low Stock Alerts) | `report.view` |
| GET | `/analytics/financial-trend` | Get monthly revenue, expense trends, and profit summaries | `report.view` |

### Payments Ledger
Maintains payments as first-class ledger records.

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| GET | `/payments` | Paginated payments list with status, date, invoice, and customer filters | `payment.view` |
| GET | `/payments/:id` | Detailed payment information, invoice mapping, and audit logs | `payment.view` |

### Organization Users
Manage tenant-isolated memberships and roles.

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| GET | `/organization/users` | List tenant members, roles, status, and warehouse assignments | `business.view` |
| POST | `/organization/users/invite` | Invite a new user to the business tenant (simulated email invite) | `business.manage` |

### Custom Roles
Exposes dynamic RBAC configurations.

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| GET | `/roles` | List all built-in system roles and custom tenant roles | `business.view` |
| POST | `/roles` | Create a new custom role with custom permission keys | `business.manage` |
| PATCH | `/roles/:id` | Update description or permissions of a custom role | `business.manage` |
| DELETE | `/roles/:id` | Delete a custom role | `business.manage` |

### Permissions
Lists available system catalog capabilities.

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| GET | `/permissions` | Retrieve module permissions, action permissions, and role-to-permission mappings | `business.view` |

### Subscription Foundation
Tracks subscription plans and resource limits.

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| GET | `/subscription` | Get active tenant subscription and plan features | `business.view` |
| GET | `/subscription/usage` | Compare actual counts (users, warehouses, products) against plan limits | `business.view` |

### Reporting Aggregates
Exposes advanced transactional aggregate reports.

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| GET | `/reports/sales` | Detailed sales performance, taxes, discounts, and item breakdowns | `report.view` |
| GET | `/reports/inventory` | Inventory valuation, warehouse breakdown, and low stock warnings | `report.view` |
| GET | `/reports/financial` | Revenue, expenses, net profit, and general ledger references | `report.view` |

