# AgriQon ERP Backend Development Roadmap

This document tracks the implementation progress of the AgriQon Enterprise ERP Backend, based on the **Data Flow Diagram (DFD)** and **Structure and Rules** documentation.

## Phase 5: Infrastructure & Async Processing (High Priority)
*Objective: Move from synchronous operations to a robust, event-driven background processing architecture.*

- [x] **Redis & BullMQ Setup**
  - Implement `src/app/lib/redis.ts`
  - Implement `src/app/lib/bullmq.ts`
  - Create job workers in `src/workers/` (Email, Notification, Report, Accounting, Customer, Reconciliation)
- [x] **Outbox Pattern Implementation**
  - Refine `OutboxEvent` processing in `src/app/modules/events/`
  - Implement a background Poller to process and dispatch events
  - [x] Map Product events (Created/Updated) to AI & Search queues
- [x] **Inventory Reservation System**
  - Implement reservation timer using BullMQ delayed jobs
  - Auto-release stock if checkout isn't completed within 15 minutes

## Phase 6: Financial & Accounting Core
*Objective: Ensure financial accuracy and double-entry compliance.*

- [x] **Double-Entry Accounting Engine**
  - Implement `JournalEntry` creation logic in `AccountingService`
  - Automated ledger posting for Sales, Purchases, and Refunds
- [x] **Cost Valuation (WAC)**
  - Implement Weighted Average Cost (WAC) calculation during Goods Receipt (Procurement)
- [x] **Financial Reporting Engine**
  - Real-time calculation logic for P&L, Balance Sheet, and Trial Balance
  - Report caching system using Redis

## Phase 7: AI & Advanced Features
*Objective: Transform data into actionable intelligence.*

- [x] **Real AI Integration**
  - [x] Audit existing AI infrastructure (Repository, Worker, Service)
  - [x] Implement Multi-Provider Architecture (Gemini/OpenAI)
  - [x] Replace mock vectors with real AI embeddings
  - [x] Implement business context-aware RAG pipeline
  - [ ] Fine-tune similarity search thresholds (pgvector) **(IN PROGRESS)**
- [ ] **Loyalty Program**
  - Implement point calculation and redemption logic
  - Loyalty ledger tracking
- [x] **Warehouse Transfers**
  - Multi-warehouse stock movement logic with transit states

## Phase 8: Hardening & Integrity
*Objective: Production-ready reliability.*

- [x] **Inventory Integrity & Lifecycle Fixes**
  - [x] Optimized batch stock updates to prevent optimistic locking conflicts
  - [x] Unified stock return logic on order cancellation
  - [x] Automated stock reservation confirmation on payment completion
  - [x] Hardened background workers with proper error propagation for retries
- [x] **Reconciliation & Auditing**
  - [x] Scheduled jobs for reconciliation (BullMQ Workers)
  - [ ] Automated daily inventory vs movement audit **(CURRENT FOCUS)**
- [ ] **Infrastructure & Stability**
  - [x] Implement `docker-compose.yml` for local Redis & DB services
  - [ ] Standardize `.env` configuration across the team
- [ ] **Data Integrity Checks**
  - Verify Stock vs. Movements
  - Payment vs. Invoice reconciliation
- [ ] **Audit Trail Expansion**
  - Comprehensive logging for all sensitive business events
- [ ] **API Idempotency**
  - Implement idempotency-key check for Orders and Payments

## Phase 9: Advanced Enterprise Modules
*Objective: Full-suite ERP capabilities for large-scale operations.*

- [ ] **Batch & Expiry Tracking**
  - Implement Batch Number management in Inventory
  - FEFO (First Expired First Out) stock logic
- [ ] **Quality Control (QC)**
  - Inspection stage before Stock-In
  - Quarantine/Return workflow
- [ ] **Payroll & Asset Management**
  - Basic Salary structure and Staff Payslips
  - Fixed Asset registration and Depreciation calculator
- [ ] **Tax Compliance Engine**
  - Configurable Tax Zones and Automated VAT calculation

---

## Technical Decision: BullMQ vs RabbitMQ

**Recommendation: BullMQ**

For the current AgriQon architecture (Node.js/TypeScript monorepo), **BullMQ** is recommended over RabbitMQ for the following reasons:

1. **Ecosystem Fit:** BullMQ is native to Node.js and handles serialization/deserialization perfectly within the TypeScript environment.
2. **Infrastructure Simplicity:** Since we already plan to use Redis for caching and session management, adding BullMQ doesn't require a new infrastructure component (like an Erlang-based RabbitMQ cluster).
3. **Features:** BullMQ supports complex workflows like parent-child job dependencies, delayed jobs (critical for our 15-min stock reservation), and rate limiting out-of-the-box.
4. **Maintenance:** Managing a Redis instance is generally simpler than managing a RabbitMQ cluster for a growing SaaS.

---

## Final Architecture Goal

```txt
modular
event-driven
transaction-safe
tenant-isolated
queue-powered
batch-aware
audit-compliant
enterprise backend
```

