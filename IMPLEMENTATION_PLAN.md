# AgriQon Backend — Master Implementation Plan

> **Last Updated:** 2026-05-14
> **Build Status:** ✅ Passing
> **Core Focus:** Enterprise Hardening & Financial Integrity

---

## 📊 Current State Snapshot

| Module | Status | Tests | Notes |
|--------|--------|-------|-------|
| `auth` | 🟡 | 🧪 | **Hardening Required**: Refresh tokens need hashing; session families needed. |
| `permissions` | 🟡 | ❌ | **Core Ready**: `RoleRepository` & `RoleService` implemented. |
| `notifications` | ✅ | ❌ | **Architecture Ready**: Needs idempotency & queue drivers. |
| `business` | 🟡 | ❌ | **Hardening Required**: Needs DB-level composite tenant isolation. |
| `inventory` | ✅ | ✅ | **Enterprise Ready**: Optimistic locking & WAC valuation implemented. |
| `orders` | ✅ | 🧪 | Idempotency exists. Needs link to journal ledger. |
| `payments` | ✅ | 🧪 | Multi-gateway integrated. Needs raw webhook event store. |
| `accounting` | 🟡 | ❌ | Ledger stubs present. **Needs immutable Journal system.** |
| `uploads` | ❌ | ❌ | **Missing**: Needs malware scanning & signed URLs. |

---

## 🛣️ Phase Roadmap

### 🔴 PHASE 1 — Enterprise Hardening & Security (Immediate)
| Task | Status | Note |
|------|--------|------|
| **Tenant Isolation** | ❌ Todo | Implement composite keys `(businessId, id)` to enforce DB-level isolation. |
| **Auth Hardening** | ❌ Todo | Hash refresh tokens & implement token family reuse detection. |
| **Upload Security** | ❌ Todo | Implement MIME validation, EXIF stripping, and signed URLs. |
| **Webhook Event Store** | ❌ Todo | Create robust event store for verification and replay protection. |
| **Idempotency Layer** | ❌ Todo | Global idempotency for async jobs and notifications. |

### 🟠 PHASE 2 — Financial Integrity & Procurement
| Task | Status | Note |
|------|--------|------|
| **Immutable Ledger** | ❌ Todo | Replace stubs with `JournalEntry` / `JournalLine` double-entry system. |
| **Purchase Domain** | ❌ Todo | Implement `Supplier`, `PurchaseOrder`, and `GoodsReceipt`. |
| **Reconciliation Jobs** | ❌ Todo | Nightly stock movement vs. inventory projection sync. |
| **Warehouse Transfers** | ❌ Todo | Inter-warehouse movement logic + tests. |

### 🟡 PHASE 3 — Feature Completion & Scale
- [ ] **AI Module**: Demand forecasting and pricing model integration.
- [ ] **Rate Limiting**: Multi-dimensional strategy (IP, User, Tenant, Route).
- [ ] **Reports**: Sales summary, inventory valuation dashboard.
- [ ] **Outbox Monitoring**: Alerting for failed event processing.

---

## 🛠️ Detailed Hardening Tasks

### 1. Database-Level Isolation
- [ ] Refactor Prisma models to include `businessId` in primary/unique keys.
- [ ] Update foreign keys to use composite relations `(businessId, foreignId)`.
- [ ] This prevents cross-tenant joins even if application-level filters fail.

### 2. Auth Security
- [ ] Hash refresh tokens before storage (SHA-256).
- [ ] Add `tokenFamilyId` and `rotatedFrom` to track session lineages.
- [ ] Implement strict reuse detection (invalidate family on reuse).

### 3. Financial Source of Truth
- [ ] Implement the `Journal` system where every financial event is immutable.
- [ ] Wire `PaymentSuccess` and `Refund` events to generate journal lines.
- [ ] Wire `Wastage` and `Purchase` events to the ledger.

---

## ✅ Hardening Success Criteria
1. No record can be accessed without a matching `businessId` at the SQL level.
2. Compromised database does not leak usable refresh tokens.
3. Every inventory change has a corresponding `StockMovement` and `JournalEntry`.
4. Webhooks are deduplicated and verified before processing.
