# ARCHITECTURE_DECISIONS.md

This document serves as the project's Architecture Decision Record (ADR) history and architecture constitution for the AgriQon ERP system. It records and formalizes all major architectural decisions made throughout the project's history, including its strategic pivot from a marketplace to a multi-tenant ERP SaaS.

---

## Reconstruction of Architectural Decisions

### 1. Multi-Tenant Isolation Strategy

Decision: Shared-Database, Shared-Schema, Shared-Process Multi-Tenancy (Logical Isolation via Foreign Key `businessId`)
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-01
Context: The application requires isolated workspaces (tenants) for businesses. The target customer base consists of small and medium enterprises (SMEs) with low to moderate transaction volumes. The infrastructure must remain cost-efficient while avoiding the operational complexity of managing hundreds of individual database instances.
Alternatives Considered:
1. Database-per-Tenant: Rejected due to high infrastructure cost, connection pool limits, and complex database migration execution at scale.
2. Schema-per-Tenant (PostgreSQL schemas): Rejected due to migration performance degradation at scale (e.g., executing migrations across hundreds of schemas) and Prisma schema-mapping complexities in monorepo structures.
Why Chosen: Maximizes hardware resource utilization by sharing a single database instance and connection pool. It aligns perfectly with PostgreSQL's indexing capabilities and Prisma's relation models, enabling simple cross-tenant aggregation for platform-wide admin analytics.
Benefits:
- Lowest possible infrastructure costs and overhead.
- Simple global database migration runs via a single command (`prisma migrate dev`).
- Easy tenant onboarding; creating a tenant is a simple insert into the `Business` table.
Drawbacks:
- Risk of cross-tenant data leaks if developers forget to filter queries by `businessId`.
- Shared resources present a "noisy neighbor" risk where one tenant's heavy queries degrade performance for all.
Future Impact: Demands strict application-layer validations, automated integration tests, and reconciliation audits (e.g., `ReconciliationService`) to guarantee that no transaction bypasses the `businessId` scope.

---

### 2. Tenant Resolution Strategy

Decision: HTTP Custom Headers (`x-business-id`) with JWT Claims Fallback in `tenant.middleware.ts`
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-05
Context: The backend API needs to identify which tenant a request belongs to before executing controller actions. Users can belong to multiple businesses and must be able to switch contexts dynamically without having to re-authenticate or receive new JWTs.
Alternatives Considered:
1. Subdomain-based Resolution (e.g., `tenant-a.agriqon.ai`): Rejected due to complex dynamic DNS configurations, SSL certificate management overhead, and difficulties with local development setups.
2. JWT Claims Only: Rejected because it does not allow a user with multiple business mappings to switch context without forcing a token refresh cycle.
Why Chosen: Providing an HTTP header check (`x-business-id`) gives the frontend developer maximum flexibility to send requests for different business contexts. Falling back to the JWT-encoded `businessId` claim ensures basic sessions and API clients (like Postman or mobile apps) operate with secure, predictable defaults.
Benefits:
- Decoupled from DNS and domain configuration.
- Instantly switch workspaces on the client-side by modifying the header payload.
Drawbacks:
- Client-side developers must maintain the active workspace state and ensure the custom header is attached to all outbound requests via interceptors.
Future Impact: Enforces validation on the backend (via `attachBusinessRole` middleware) to verify that the requesting user actually holds a valid role for the business specified in `x-business-id`.

---

### 3. RBAC Design

Decision: Tenant-Scoped Business Role Mapping (`OWNER`, `MANAGER`, `STAFF`) via `UserBusinessRole` Join Table
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-05
Context: ERP users have varying operation access. A user can be an `OWNER` of one business tenant, a `MANAGER` of another, and have no access to others. Global roles (e.g., a simple `role` column on the `User` table) are insufficient for multi-tenant boundary scoping.
Alternatives Considered:
1. Global Roles: Rejected because they fail to capture tenant boundaries.
2. Fully Dynamic custom role templates for all tenants: Rejected as a primary mechanism due to initial configuration complexity for simple onboarding.
Why Chosen: Combines static, hierarchically structured roles (`OWNER`, `MANAGER`, `STAFF`) that cover 90% of SME business operations, with the option to map dynamic permissions.
Benefits:
- Simple onboarding and role-assignment logic.
- Clear structural boundaries: `OWNER` controls billing/subscriptions, `MANAGER` controls operations, `STAFF` is restricted to data entry.
Drawbacks:
- A rigid three-tiered hierarchy restricts unique business organizational structures.
Future Impact: Resolved by introducing a `CustomRole` model mapped to the `Business` table, allowing tenants to define custom permission mappings on top of the static role hierarchy.

---

### 4. Permission-Based Authorization

Decision: Granular Permission Keys (Dot-Notation) Resolved via `PermissionService` Middleware
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-06
Context: Hardcoding role-checks (e.g., `if (user.role === 'MANAGER')`) in API routes creates fragile code that is difficult to maintain. If a permission moves from `MANAGER` to `STAFF`, developers would have to modify code in dozens of controllers.
Alternatives Considered:
1. Role-Based Route Guards: Rejected due to maintenance overhead and high risk of security drift.
2. Scope-based OAuth tokens: Rejected due to complexity in token generation and verification.
Why Chosen: Separating access into 86 granular permission strings (e.g., `product.create`, `inventory.manage`, `accounting.post`) configured in a central registry (`permissions.ts`) enables updating access matrices without changing API routing code.
Benefits:
- Highly modular route gating (using `authorizeAny` and `authorizeAll` middleware).
- Seamless UI component toggling on the frontend using layout-level permission checks.
Drawbacks:
- Adds a database lookup step to fetch the permissions associated with custom roles on each request, creating minor overhead.
Future Impact: To prevent performance degradation, the permission resolver must use localized caching (e.g., Redis or request-context memory) to cache user permission sets.

---

### 5. UserBusinessRole Design

Decision: Explicit `UserBusinessRole` Join Table with Composite Unique Constraints
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-05
Context: The database must model a many-to-many relationship between `User` and `Business` with metadata (such as the specific role assigned for that relation).
Alternatives Considered:
1. Array of business roles embedded directly on the `User` table: Rejected as it violates database normalization rules and complicates queries.
2. Implicit Prisma many-to-many relationships: Rejected because they do not support storing custom attributes (like the `BusinessRole` enum value) on the join table.
Why Chosen: Defining an explicit join model `UserBusinessRole` in `schema.prisma` mapping `userId`, `businessId`, and the assigned `role` enum. The composite unique constraint `@@unique([userId, businessId])` prevents double-assignment.
Benefits:
- Normal database architecture.
- Database indexes on `businessId` optimize user listings inside a tenant.
Drawbacks:
- Requires join queries during authentication.
Future Impact: Seamlessly supports single-identity login, allowing a user to authenticate once and navigate across multiple business workspaces.

---

### 6. Backend Source of Truth Philosophy

Decision: API-First Business Rule Enforcement (Frontend as Presentation Only)
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): Active Project Constraint
Context: Frontend code runs on untrusted clients and can be bypassed or manipulated. Crucial business operations, such as inventory stock deductions, double-entry ledger balancing, and subscription limitations, must be secure.
Alternatives Considered: None.
Why Chosen: Essential for security and regulatory compliance. All permissions, usage limits, read-only blocks, and ledger postings are calculated and validated exclusively on the backend. Frontend UI states (like disabling buttons or hiding pages) are strictly for user experience (UX) enhancements.
Benefits:
- Resilient security; API client requests are validated identically to web-client requests.
- Avoids duplicating complex business rules on the frontend.
Drawbacks:
- Increases server CPU usage due to repeated validation checks.
Future Impact: The backend API must remain completely stateless and secure, preventing any direct client mutations that bypass business validations.

---

### 7. Prisma ORM Selection

Decision: Prisma Client with Isolated Monorepo Output Location (`src/generated/client`)
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-10
Context: In a monorepo setup, shared dependencies can conflict if multiple packages run different versions of Prisma compilation into the standard `node_modules` directory.
Alternatives Considered:
1. TypeORM: Rejected due to maintenance complexity and unstable schema synchronization.
2. Drizzle ORM: Rejected because of team familiarity with Prisma's robust migrations runner and schema file structure.
Why Chosen: Prisma allows configuring a custom compilation path (`output = "../src/generated/client"`). This isolates generated types and query builders within the backend package directory, avoiding monorepo dependency collisions.
Benefits:
- Strongly typed query generation without package resolution conflicts.
- Declarative migrations.
Drawbacks:
- Prisma's query builder has minor performance overhead and lacks optimization for complex database locking scenarios.
Future Impact: Heavy transactional operations (like outbox lock processing or deep financial reporting) bypass the Prisma query builder and execute raw SQL queries (`prisma.$queryRaw`).

---

### 8. PostgreSQL Selection

Decision: PostgreSQL with pgvector and GIN Search Indexes
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-15
Context: The database must handle high-precision financial decimals, enforce ACID transaction boundaries for ledgers, support keyword search for stock catalogs, and store high-dimensional embeddings for AI features.
Alternatives Considered:
1. MySQL: Rejected due to lack of vector search extensions (`pgvector`) and weaker full-text search index options.
2. MongoDB: Rejected due to lack of relational double-entry ledger constraints.
Why Chosen: PostgreSQL is the industry standard for relational transactions. Extensions like `pgvector` allow storing AI embeddings in the same database as transactional records, avoiding the cost of a standalone vector database.
Benefits:
- Strict transactional consistency (ACID).
- Built-in GIN index mappings speed up search query vectors.
Drawbacks:
- Connection-heavy architecture; requires PgBouncer or connection pooling mechanisms at scale.
Future Impact: The database connection string is split into `url` (routed through a pooler) and `directUrl` (for running migrations directly) to prevent connection pool exhaustion.

---

### 9. Backend Framework Selection (Express.js Modular Monolith)

Decision: Standard Express.js Modular Architecture (NestJS Rejected)
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-01
Context: While NestJS was considered for its structured decorators and dependency injection, the codebase was implemented using raw Express.js routes, controllers, and services to minimize runtime boot overhead and compilation complexity.
Alternatives Considered:
1. NestJS: Rejected to keep the codebase simple and lightweight without decorator compiler abstractions.
Why Chosen: Express.js provides a simple, lightweight setup with no decorator overhead. Teams can write standard JS/TS middleware functions without learning NestJS-specific concepts.
Benefits:
- Faster server startup times.
- Simple middleware chains for authorization (`extractAuth`, `requireTenant`, `attachBusinessRole`).
Drawbacks:
- Lacks structural, opinionated architectural rules, requiring manual discipline to prevent code rot.
Future Impact: Enforces modular separation (`src/app/modules/<domain>/`) to maintain the codebase as a clean, modular monolith.

---

### 10. React Architecture

Decision: React 19 Client-Side Rendered Components with Tailwind PostCSS
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-25
Context: The ERP dashboard requires dynamic elements, such as tables, real-time charts, and interactive modals.
Alternatives Considered:
1. Vue 3 / Nuxt: Rejected to maintain team alignment on React.
2. React 18: Skipped in favor of React 19 to leverage the new React compiler (`babel-plugin-react-compiler`) for automatic rendering optimizations.
Why Chosen: React 19's compiler automates component optimization (reducing manual `useMemo` and `useCallback` implementations), speeding up development.
Benefits:
- Automatic rendering optimizations.
- Native integration with Tailwind CSS v4.
Drawbacks:
- Third-party packages must be monitored for compatibility with React 19.
Future Impact: Requires strict dependency testing before upgrading frontend libraries.

---

### 11. Next.js Architecture

Decision: Next.js 16 App Router with Webpack Compilation (Turbopack Disabled)
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-25
Context: Next.js provides file-based routing and layout nesting.
Alternatives Considered:
1. Vite (Single Page App): Rejected due to lack of server-side rendering (SSR) and SEO management capabilities.
2. Next.js with Turbopack: Disabled (`--webpack` flag enforced in package scripts) due to compatibility issues with custom PostCSS plugins.
Why Chosen: App Router allows nesting layouts (e.g., `(erp)` and `(auth)`) to isolate header assets, navigation blocks, and context providers.
Benefits:
- Layout isolation.
- Optimized server builds.
Drawbacks:
- Webpack compiler runs slower than Turbopack in development mode.
Future Impact: Future upgrades should target Turbopack once plugins are fully compatible.

---

### 12. shadcn/ui Standardization

Decision: shadcn/ui Preset `radix-vega` with Lucide Icons
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-26
Context: The ERP requires high-quality, responsive, and accessible UI components without writing raw elements from scratch.
Alternatives Considered:
1. Material UI (MUI): Rejected due to heavy runtime theme styling.
2. Chakra UI: Rejected in favor of shadcn's Tailwind-native copy-paste style.
Why Chosen: Gives complete code ownership of components while enforcing Radix UI accessibility compliance.
Benefits:
- Accessible components.
- Easy customization via Tailwind classes.
Drawbacks:
- Increases file count in the project.
Future Impact: Standardizes the interface style across all ERP dashboard modules.

---

### 13. React Query (TanStack Query) Usage

Decision: TanStack React Query v5 for API Cache Management
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-01
Context: Managing complex API loading, error, caching, and mutations manually across components leads to duplicate state logic.
Alternatives Considered:
1. Redux Toolkit Query (RTK Query): Rejected as Redux is not used; Zustand is the chosen state library.
2. SWR (NextJS Native): Rejected as TanStack Query provides better mutation and query invalidation tools.
Why Chosen: Out-of-the-box support for pagination, query invalidation (automatically reloading lists on creations/edits), and offline caching.
Benefits:
- Reduces component boilerplate.
- Consistent data synchronization.
Drawbacks:
- Learning curve for new engineers.
Future Impact: Key queries (e.g., subscription statuses) use Query Key invalidation to refresh the UI immediately after actions.

---

### 14. Queue Architecture

Decision: Event-Driven Transactional Outbox backed by Redis Message Queue
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-16
Context: Standard databases cannot write records and publish events to external systems atomically. Network failures during events publish can leave the system in an inconsistent state.
Alternatives Considered:
1. Direct Worker Calls (Synchronous): Rejected as network failures could cause transactions to roll back.
2. Kafka/RabbitMQ: Rejected due to high operational complexity for initial project size.
Why Chosen: The transactional outbox pattern guarantees that events are saved to the database in the same transaction as the business mutation, then polled and enqueued to background workers safely.
Benefits:
- Guaranteed event execution (At-Least-Once delivery).
- Asynchronous execution keeps API request paths fast.
Drawbacks:
- Requires background database polling and Redis running at all times.
Future Impact: Critical ledger accounting uses this to ensure that if an order payment fails, the ledger remains balanced.

---

### 15. BullMQ Adoption

Decision: BullMQ backed by ioredis for Background Job Processing
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-16
Context: Node.js is single-threaded; heavy CPU tasks (like AI embedding generation, PDF invoice creation, global database audits) must not block the web server.
Alternatives Considered:
1. Kue: Deprecated.
2. Celery (Python): Rejected to keep the codebase unified in TypeScript.
Why Chosen: BullMQ is the fastest, most reliable queue library for Node.js. It supports cron schedules, job retries with backoff, parent-child job chains, and rate limiting.
Benefits:
- Excellent performance utilizing Redis.
- Automatic retry strategies.
Drawbacks:
- Introduces Redis as a runtime dependency.
Future Impact: Worker scaling can occur independently of the web API nodes by launching dedicated worker processes.

---

### 16. Audit Logging Strategy

Decision: Database-Stored Immutable `AuditLog` with Previous/New Data Diffs
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-08
Context: Compliance regulations require tracing user actions (e.g., balance updates, permission adjustments, inventory corrections).
Alternatives Considered:
1. File-System Logs (Winston/Pino): Rejected because they are difficult to query from the platform dashboard.
2. Third-Party Audit Services: Rejected due to privacy regulations.
Why Chosen: An explicit `AuditLog` table containing `previousData`, `newData`, `changedFields`, `ipAddress`, and `userAgent` allows the system to render audit trails inside the app.
Benefits:
- Auditable history.
- Resilient logging (failures during audit logging do not block parent transactions).
Drawbacks:
- Rapidly inflates the database size.
Future Impact: Requires automated database archiving scripts for audit records older than 1 year.

---

### 17. Session Management Strategy

Decision: Hashed Refresh Tokens with Rotation Lineage (`familyId`) Tracking
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-08
Context: JWTs cannot be revoked easily before they expire. The system requires secure session tracking to prevent token theft.
Alternatives Considered:
1. Short-lived JWTs only: Rejected due to poor UX (forcing users to log in frequently).
2. Redis Session Storage: Rejected to maintain stateless API nodes.
Why Chosen: Storing hashed refresh tokens in the database with a `familyId` enables token rotation. If a stolen token is reused, the entire token family is revoked, protecting the user.
Benefits:
- Detects and prevents session hijacking.
- Allows users to view and revoke active sessions.
Drawbacks:
- Requires database writes on token refresh.
Future Impact: Clean up expired tokens daily via repeatable cron jobs.

---

### 18. MFA Architecture

Decision: Speakeasy TOTP Authentication with Two-Step Login Handshake
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-08
Context: Enterprise software requires Multi-Factor Authentication to secure logins.
Alternatives Considered:
1. SMS/Email OTP: Rejected due to carrier delivery costs and security vulnerabilities (SIM swapping).
2. WebAuthn/FIDO2: Rejected due to high initial implementation complexity.
Why Chosen: TOTP (authenticator apps) is free, secure, and easily implemented using the standard RFC 6238 spec via `speakeasy`.
Benefits:
- No external messaging provider costs.
- Secure, standard implementation.
Drawbacks:
- Users can lock themselves out if they lose their secret key.
Future Impact: Generated backup recovery codes are provided during setup to prevent lockouts.

---

### 19. Security Model

Decision: Multi-layered Zero-Trust Gate (Helmet, CORS, Rate Limit, CSRF, JWT, MFA, IP Rule, RLS)
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-08
Context: Production SaaS ERPs handle sensitive financial and inventory data, making them high-value targets.
Alternatives Considered: None.
Why Chosen: Security must be applied in depth. If one layer fails, other layers prevent access.
Benefits:
- Protections against automated attacks and injection vectors.
- Enforces secure defaults.
Drawbacks:
- Increases API response latency due to multiple checks.
Future Impact: Regular automated security vulnerability assessments (using tools like Semgrep) must be run before deployment.

---

### 20. Subscription Architecture

Decision: SubscriptionPlan Engine with Feature Mappings and Usage Metric Rollups
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-07
Context: The platform is a SaaS product that charges based on user counts, warehouse counts, and active features.
Alternatives Considered:
1. Stripe Billing Engine: Rejected as the primary source of truth because SSLCommerz and local mobile wallets (bKash, Nagad) do not integrate with Stripe's subscription logic.
Why Chosen: A database-driven subscription engine enables payment gateway flexibility. The system maps plans to permissions and limits in PostgreSQL, checking them before operations.
Benefits:
- Supports local payment methods.
- Fast checks using queries.
Drawbacks:
- Requires writing billing logic in-house.
Future Impact: Enables the introduction of pay-as-you-go pricing models.

---

### 21. Trial Provisioning Strategy

Decision: Automatic Provisioning of TRIAL Plan upon Tenant Creation
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-07
Context: New users want to explore the workspace immediately after registration.
Alternatives Considered:
1. Payment Details First: Rejected as it reduces user signup conversion rates.
2. Manual Trial Assignment: Rejected due to operation overhead.
Why Chosen: Simple, automated flow. The database seeds default trial periods (`subscriptionTrialDays: 14`), setting bounds on products, users, and warehouses automatically.
Benefits:
- Frictionless onboarding.
Drawbacks:
- Vulnerable to trial abuse (users registering multiple accounts).
Future Impact: Requires automated alerts when a trial is near expiry.

---

### 22. Grace Period Strategy

Decision: Read-Only Access Transition upon Subscription Expiry
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-07
Context: Hard-blocking access immediately when a payment fails harms user trust.
Alternatives Considered:
1. Immediate Lockout: Rejected as too disruptive.
2. Infinite Grace Period: Rejected as it reduces payment incentive.
Why Chosen: Enforces a 7-day grace period. Users can log in, view records, run reports, and process payments, but all write mutations (creations/edits) are blocked.
Benefits:
- Empathetic UX design.
- Secures payment collection without deleting data.
Drawbacks:
- Requires complex check logic on every write operation.
Future Impact: Handled by the unified `ReadOnlyGuardService` checker.

---

### 23. Feature Gating Strategy

Decision: PlanFeature Mapping via `validateFeatureAccess` Middleware
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-07
Context: Access to premium features (like AI reports, accounting ledger, multi-branch operations) is restricted by plan.
Alternatives Considered:
1. Hardcoded Plan Checks: Rejected due to maintenance overhead.
Why Chosen: Mapping feature keys (`FeatureCode` enum) to the `PlanFeature` model allows features to be adjusted dynamically in the database.
Benefits:
- No code changes required to adjust plan packaging.
Drawbacks:
- Adds database query overhead to check feature access.
Future Impact: Caching active features in the request context avoids query replication.

---

### 24. Usage Limits Strategy

Decision: Atomic Count Rollups Checked on Mutating Operations
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-07
Context: Subscriptions enforce limits on users, products, and warehouses.
Alternatives Considered:
1. Real-time Count Queries: Rejected as they can degrade performance on large tables.
2. Cached Metric Table: Rejected due to potential cache synchronization issues.
Why Chosen: Balanced approach. It performs fast count queries for a tenant's users, products, and warehouses before creation, rejecting the request if it exceeds limits.
Benefits:
- Ensures data consistency.
Drawbacks:
- Slightly slows down creation endpoints.
Future Impact: Will be optimized by introducing pre-aggregated count caches if database tables grow large.

---

### 25. Payment Verification Strategy

Decision: Webhook Verification with Cryptographic Signatures and Manual Sync Fallback
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-07
Context: Webhooks can be lost, forged, or delayed, leaving invoices unpaid.
Alternatives Considered:
1. Webhook Only: Rejected because network dropouts can drop webhooks.
2. Polling API Only: Rejected as it delays updates.
Why Chosen: Multi-channel approach. The webhook processes automatically using signature verification, while the frontend provides a manual refresh trigger to sync status.
Benefits:
- Resilient billing.
Drawbacks:
- Requires managing duplicate processing states.
Future Impact: Handled by the transaction blocks and webhook replay protection.

---

### 26. API Design Philosophy

Decision: RESTful JSON API with Versioning Prefix `/api/v1`
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-01
Context: The frontend and potential future mobile applications require a standardized communication protocol.
Alternatives Considered:
1. GraphQL: Rejected due to high development overhead for standard CRUD operations.
2. gRPC: Rejected due to complex frontend integration.
Why Chosen: Standard, widely supported protocol. Versioning `/api/v1` ensures we can release `/api/v2` without breaking legacy integrations.
Benefits:
- Familiar pattern.
- Easy testing.
Drawbacks:
- Potential over-fetching.
Future Impact: Response sizes are optimized using selective Prisma queries.

---

### 27. Modular Monolith Decision

Decision: Modular Monolith over Microservices
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-01
Context: Microservices introduce deployment and local development complexity that can slow down small teams.
Alternatives Considered:
1. Microservices: Rejected due to high infrastructure management overhead.
Why Chosen: A modular monolith allows the codebase to reside in a single project while keeping boundaries separated by modules (using distinct folders, routers, and services).
Benefits:
- Easy to test and deploy.
- Simple database transactions.
Drawbacks:
- Cannot scale modules independently.
Future Impact: If a module (like the AI processor) becomes heavy, it can be extracted into a separate service later since its code boundaries are already isolated.

---

### 28. AI Infrastructure Readiness Decisions

Decision: High-Failover Multi-Provider AI Routing (Gemini Primary, OpenAI Fallback)
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-16
Context: AI APIs frequently suffer from rate limits, quota issues, or transient network timeouts. Critical ERP functions must remain online.
Alternatives Considered:
1. Single AI Provider: Rejected due to dependency risks.
Why Chosen: Wraps AI requests in a retry loop. If the primary provider (Google Gemini) fails, it automatically switches to the fallback provider (OpenAI).
Benefits:
- High availability for AI features.
Drawbacks:
- Requires maintaining API keys and formats for multiple providers.
Future Impact: The `AiService` handles translations and mappings dynamically.

---

### 29. Analytics Architecture

Decision: Real-Time Aggregate Queries with Redis-Cached Report Tables
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-18
Context: Generating reports (balance sheets, profit/loss, trial balance) over millions of ledger lines dynamically causes heavy database loads.
Alternatives Considered:
1. Dedicated Data Warehouse (OLAP): Rejected due to complex real-time sync setups.
Why Chosen: Queries run directly on the PostgreSQL transactional database, but results are cached in the `ReportCache` table with expiration limits.
Benefits:
- Real-time reporting.
- Simple infrastructure.
Drawbacks:
- Requires cache invalidation when accounting entries are posted.
Future Impact: Cache invalidations are triggered via BullMQ jobs when journal entries are posted.

---

### 30. Transactional Outbox Pattern

Decision: Database-driven outbox polling using `FOR UPDATE SKIP LOCKED`
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-16
Context: Publishing events to Redis/BullMQ during a database transaction can lead to inconsistencies if the transaction rolls back but the event was already sent.
Alternatives Considered:
1. Publish-on-Commit hooks: Rejected as node crashes before publishing can lose events.
Why Chosen: Events are written directly to the `OutboxEvent` table in the same transaction. The `OutboxProcessor` polls this table, using `SKIP LOCKED` database locks to avoid multi-worker conflicts, and dispatches them to BullMQ.
Benefits:
- Guaranteed message dispatching (At-Least-Once).
Drawbacks:
- Adds write load to the database.
Future Impact: Checked by the reconciliation worker, which cleans up old processed events daily.

---

### 31. Double-Entry Accounting Ledger System

Decision: Strict Atomic Ledger Entries (Debit/Credit Equalization Check) via `accounting.repository.ts`
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-06-09
Context: The pivot to ERP requires strict double-entry ledger bookkeeping to record all monetary operations (CASH, RECEIVABLE, INVENTORY, PAYABLE, REVENUE, RETURNS, COGS). Single-entry transaction logs are highly vulnerable to drift, making them non-compliant.
Alternatives Considered:
1. Single-Entry transaction tables: Rejected due to vulnerability to data drift and lack of audit compliance.
2. Ledger calculation based on orders: Rejected because financial transactions occur outside orders (e.g., manual corrections, overhead costs, payouts).
Why Chosen: Enforces standard double-entry rules. The repository checks `Math.abs(totalDebit - totalCredit) < 0.001` before posting, updating account balances inside a database transaction block.
Benefits:
- Impeccable ledger health with mathematically guaranteed balancing.
- Simplifies third-party accountant reviews and platform audits.
Drawbacks:
- Higher query load; writing a single entry requires writing multiple `JournalLine` records.
Future Impact: Monitored by `ReconciliationService` checks which run continuously to verify ledger integrity.

---

### 32. Independent Frontend-Backend Package Split

Decision: Decoupled frontend (`frontend/`) and backend (`backend/`) runtimes without monorepo workspace tool managers (e.g., Lerna, Yarn Workspaces)
Status: APPROVED / IMPLEMENTED
Date (estimated if unknown): 2026-05-01
Context: In large TypeScript monorepos, setting up shared workspaces can lead to complex dependency structures and locking issues.
Alternatives Considered:
1. Monorepo workspace tool managers (Yarn/NPM Workspaces): Rejected because of dependency conflicts and package lock corruption.
Why Chosen: Decoupled folders are managed separately. Dev scripts run via standard node subfolders with directory flags (`--prefix`), keeping package dependency definitions clean and direct.
Benefits:
- Fast builds; no global monorepo link structures.
- Decoupled dependency upgrades (e.g., React 19 on frontend, ts-node-dev on backend).
Drawbacks:
- Cannot easily share TypeScript typings directly; requires separate generation or duplicate mappings.
Future Impact: Keeps development pipelines clear, allowing simple deployment of either frontend or backend independently.

---

## Architecture Evolution Timeline

```
[Phase 1: Marketplace Foundation] (May 2026)
  ├── Relational database layout on MySQL
  ├── Hardcoded roles (ADMIN, SELLER, BUYER) checked in controllers
  └── Synchronous background operations blocking the main API thread
        ↓
[Phase 2: Transition & Security Hardening] (June 5-8, 2026)
  ├── Migration to PostgreSQL with pgvector for vector search support
  ├── Seeding of 86 granular permission keys (role-based access freeze)
  ├── Multi-layered security (TOTP MFA, login lockout, IP rule CIDR checks)
  └── Implementation of the outbox processor & BullMQ backed by Redis
        ↓
[Phase 3: Multi-Tenant ERP Pivot] (Current Phase - June 9-13, 2026)
  ├── Removal of legacy marketplace storefront pages and Buyer/Seller roles
  ├── Implementation of atomic double-entry journal postings (CASH, COGS, etc.)
  ├── System health checks inside ReconciliationService (ledger balancing)
  └── Active work: Refactoring frontend auth context and dashboard layout guards
```

---

## Architectural Principles That Must Never Be Violated

1. **Strict Tenancy Scoping**: Every database operation (query, mutation, update, delete) must explicitly filter by `businessId` to prevent cross-tenant data leaks. The only exception is platform-level operations executed by a `SUPER_ADMIN` platform role.
2. **Granular Permission Checks**: No API route or controller may check roles directly (e.g., checking if the user is a `MANAGER`). All gates must verify explicit, granular permission keys (dot-notation format) via `authorizeAny` or `authorizeAll` middleware.
3. **Fail-Closed Authorization**: If a permission evaluation, database query, or header context check fails or throws an exception, access must be immediately denied (HTTP 403) by default.
4. **Double-Entry Balance Integrity**: No financial mutation may alter an account balance directly. All monetary adjustments must be recorded as equal and balanced debits and credits on `JournalLine` items associated with a posted `JournalEntry`.
5. **Immutable Audit Trails**: The `AuditLog` and `ReconciliationLog` tables are write-once only. No API controller or service may expose update, delete, or truncation methods for these models.
6. **Outbox Pattern Isolation**: Background queues and external email calls must never be triggered synchronously inside controller request handlers. They must first be recorded in the `OutboxEvent` table in the same transaction block.
7. **MFA Isolation**: A user with Multi-Factor Authentication enabled must not gain access to protected business endpoints using the initial login credentials. Access is strictly blocked until the TOTP code is verified.
