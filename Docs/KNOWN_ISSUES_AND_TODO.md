# KNOWN_ISSUES_AND_TODO.md

This document tracks all verified functional issues, architectural violations, frontend/backend gaps, security vulnerabilities, and technical debt in the AgriQon ERP codebase. It is based on a full audit of the monorepo.

---

# Critical Issues

*No critical issues currently active.*

---

# High Priority Issues

### Simulated Sandbox Payments & Mapped Webhook Signatures
- **Priority**: High
- **Area**: Security
- **Location**: [bkash.provider.ts](file:///d:/Projects/AgroAI%20Market/agriqon/backend/src/app/modules/subscriptions/gateways/bkash.provider.ts#L11-L37), [nagad.provider.ts](file:///d:/Projects/AgroAI%20Market/agriqon/backend/src/app/modules/subscriptions/gateways/nagad.provider.ts#L11-L37), and [sslcommerz.provider.ts](file:///d:/Projects/AgroAI%20Market/agriqon/backend/src/app/modules/subscriptions/gateways/sslcommerz.provider.ts#L11-L37)
- **Impact**: All mobile wallet and card providers (`bKash`, `Nagad`, `SSLCommerz`) use simulated sandbox redirects pointing directly to `localhost:3000` and generate random transaction references using `Math.random()`. The webhook signature validation check is simulated using a simple string verification `signature !== 'invalid'`, bypassing cryptographic signature verification against gateway certificates.
- **Recommended Fix**: Replace the simulated sandbox stubs with the official integration libraries and verify webhook signatures against keys provided by the gateways.

---



### Oversized Page and Component Bloat
- **Priority**: High
- **Area**: Frontend
- **Location**: 
  - [data-table.tsx](file:///d:/Projects/AgroAI%20Market/agriqon/frontend/src/components/data-table.tsx) (813 lines)
  - [security/page.tsx](file:///d:/Projects/AgroAI%20Market/agriqon/frontend/src/app/\(erp\)/settings/security/page.tsx) (780 lines)
  - [pos-view.tsx](file:///d:/Projects/AgroAI%20Market/agriqon/frontend/src/components/dashboard/pos-view.tsx) (676 lines)
  - [purchases/page.tsx](file:///d:/Projects/AgroAI%20Market/agriqon/frontend/src/app/\(erp\)/purchases/page.tsx) (659 lines)
  - [invoices/page.tsx](file:///d:/Projects/AgroAI%20Market/agriqon/frontend/src/app/\(erp\)/invoices/page.tsx) (596 lines)
- **Impact**: Large files mix local state, UI layout rendering, forms, validations, and tables in a single place. This violates clean code rules, makes code hard to reuse, and increases maintenance costs.
- **Recommended Fix**: Decompose large files into smaller components. Move forms, column headers, and charts into separate helper files.

---

### Lack of Frontend Automated Testing
- **Priority**: High
- **Area**: Infrastructure
- **Location**: Frontend package root
- **Impact**: The package configuration includes no unit, integration, or end-to-end testing frameworks. UI regressions and broken routes can only be identified manually by developers or users.
- **Recommended Fix**: Install Vitest and React Testing Library for frontend component unit tests, and configure Playwright to test critical user checkout flows.

---

# Medium Priority Issues

### Direct Prisma Calls inside Service Layings (Service boundary violations)
- **Priority**: Medium
- **Area**: Backend
- **Location**: `accounting.service.ts` (line 125), `reporting.service.ts` (line 64), `ai.service.ts` (line 176), etc.
- **Impact**: Multiple backend services bypass the Repository layer and query the database directly using `prisma.`. This couples services directly to database schemas, bypassing model encapsulation.
- **Recommended Fix**: Move all direct Prisma database queries from service files into their corresponding Repository classes.

---


### Generic Rate-Limiting on Authentication Routines
- **Priority**: Medium
- **Area**: Security
- **Location**: [app.ts](file:///d:/Projects/AgroAI%20Market/agriqon/backend/src/app.ts#L41)
- **Impact**: Public authentication routes (login, registration, MFA code verification) inherit the generic app-wide rate-limit (150 requests per 15 minutes), making them vulnerable to automated brute-force attacks.
- **Recommended Fix**: Apply a separate, stricter rate-limit instance (e.g. 5 attempts per 15 minutes) specifically on authentication route groups.

---

### Placeholder Email Worker Implementation
- **Priority**: Medium
- **Area**: Backend
- **Location**: [email.worker.ts](file:///d:/Projects/AgroAI%20Market/agriqon/backend/src/workers/email.worker.ts#L16)
- **Impact**: Background email jobs (like order confirmations or billing receipt notifications) print console logs instead of sending actual messages, meaning users do not receive operational emails.
- **Recommended Fix**: Integrate NodeMailer with SendGrid/Postmark API configurations to dispatch actual transactional emails.

---

# Low Priority Issues

### Missing Container Specifications
- **Priority**: Low
- **Area**: Infrastructure
- **Location**: Monorepo Root
- **Impact**: Lacks multi-stage production Dockerfiles for frontend and backend packages, which slows down standardized cloud deployments.
- **Recommended Fix**: Add multi-stage Dockerfile configurations optimized for Node.js and Next.js.

---

### Outbox Polling Database Overhead
- **Priority**: Low
- **Area**: Database
- **Location**: [outbox.processor.ts](file:///d:/Projects/AgroAI%20Market/agriqon/backend/src/shared/events/outbox.processor.ts#L161)
- **Impact**: The outbox poller runs database sweeps using raw SQL updates every second, which increases database CPU usage.
- **Recommended Fix**: Trigger Redis event dispatches on database transaction commits, reserving the outbox database sweeps strictly for fallback recovery.

---

### Swallowed Errors in Audit Log Writes
- **Priority**: Low
- **Area**: Backend
- **Location**: [usage-guard.service.ts](file:///d:/Projects/AgroAI%20Market/agriqon/backend/src/app/modules/subscriptions/usage-guard.service.ts#L66)
- **Impact**: Errors encountered during audit log writes are caught and swallowed. This prevents transaction failures but can lead to missing audit records during database timeouts.
- **Recommended Fix**: Offload audit logging to background workers using Redis queues to ensure persistent retries.

---

# Technical Debt

1. **Legacy Marketplace Modules (Reviews)**: The `reviews` module (including controllers, routers, and validators) is still registered in `app/routes/index.ts`. Since the project is transitioning to an ERP, product reviews are no longer needed.
2. **Obsolete Frontend Contexts**: The frontend maintains `cart-context.tsx` and `wishlist-context.tsx` structures, which are leftovers from the legacy marketplace storefront.
3. **Legacy UI Components**: The `product-card.tsx` component references marketplace concepts like customer star ratings, seller vendor names, and shopping carts.
4. **Prisma Client Path**: Compiling the Prisma client to `src/generated/client` solves monorepo dependencies but requires non-standard import declarations compared to standard `@prisma/client` configurations.

---

# Future Enhancements

1. **Interactive Print Template Designer**: Allow businesses to customize sales invoices and purchase receipt layouts using a drag-and-drop builder.
2. **Custom Domain SSL Mapping**: Provide automatic SSL registration and domain routing for enterprise tenants.
3. **Advanced Inventory Valuation Methodologies**: Expand from Weighted Average Cost (WAC) to support First-In, First-Out (FIFO) calculations.

---

# Recommended Next Sprint

1. **Purge Marketplace Code**: Delete the `reviews` module, unmount its routes, and delete `cart-context.tsx`, `wishlist-context.tsx`, and associated storefront files.
2. **Decompose UI Files**: Extract dialog forms, table headers, and local states from oversized pages (like `security/page.tsx` and `pos-view.tsx`) into separate sub-components.
3. **Payment Signature Verification**: Replace the payment sandbox stubs with actual gateway verification checking signed webhook payloads.
