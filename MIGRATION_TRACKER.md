# AgriQon: Marketplace → ERP SaaS Migration Tracker

**Status**: Active Migration  
**Start Date**: 2026-06-05  
**Target Completion**: TBD  
**Owner**: Development Team

---

## Executive Summary

AgriQon is undergoing a **strategic pivot from a marketplace platform to a Multi-Tenant ERP SaaS solution**. This document tracks all required changes across the codebase to remove legacy marketplace concepts and establish ERP-first architecture.

### Strategic Shift Overview

| Aspect | Before (Marketplace) | After (ERP SaaS) |
|--------|---------------------|-----------------|
| **Model** | B2B2C Marketplace | B2B Multi-Tenant SaaS |
| **Primary Users** | Buyers & Sellers | Businesses (SMEs) |
| **Core Concept** | Buy/Sell Agricultural Products | Business Management OS |
| **Authentication** | Buyer, Seller, Admin Roles | Owner, Manager, Staff + Permissions |
| **Business Scope** | Marketplace Transactions | Business Workspace (Tenant) |
| **Key Features** | Product Listings, Reviews, Orders | Inventory, Sales, Invoicing, Reporting |

---

## Phase 1: Schema & Data Model Migration

### P1.1: Database Role Model Refactoring

**Status**: ✅ Complete  
**Priority**: Critical  
**Effort**: 4-6 hours

**Current State**:
- `PlatformRole` enum: `ADMIN`, `SELLER` ❌ **REMOVED SELLER**
- `Role` enum: `SELLER`, `ADMIN` ✅ Updated
- Seed data: Updated to use `USER` role with `BusinessRole` assignments

**Target State**:
- `Role` enum: `OWNER`, `MANAGER`, `STAFF` ✅ Achieved
- SELLER completely removed ✅ 
- Permissions-based access control via `permissions` table ✅

**Completed Actions**:
- ✅ [backend/prisma/schema.prisma](backend/prisma/schema.prisma) - Updated PlatformRole enum
- ✅ [backend/prisma/seed.ts](backend/prisma/seed.ts) - Updated seed to use USER role with proper BusinessRole
- ✅ Created migration `20260605062042_init_erp_schema`
- ✅ Applied migration successfully
- ✅ Database seeded with 3 businesses, 5 users per business
- ✅ Verified 80 permissions with proper role mappings

---

### P1.2: Business Scoping Verification

**Status**: 🟡 In Progress  
**Priority**: Critical  
**Effort**: 2-3 hours

**Current State**:
- Most models include `businessId` for multi-tenancy
- Verify all business-scoped queries use `businessId` filter

**Target State**:
- Confirm RLS policies block cross-tenant access
- All service methods thread `businessId` correctly

**Files to Check**:
- [ ] [backend/src/app/modules/](backend/src/app/modules/) - All service files
  - Verify `businessId` is required parameter in repository methods
  - Audit: `products`, `orders`, `inventory`, `customers`, `invoicing`
  
- [ ] [backend/src/middleware/requireBusiness.ts](backend/src/middleware/requireBusiness.ts)
  - Ensure middleware enforces `businessId` on all protected routes

**Blockers**: None identified

---

## Phase 2: Authentication & Authorization Migration

### P2.1: Backend Auth Endpoint Refactoring

**Status**: 🔴 Not Started  
**Priority**: Critical  
**Effort**: 6-8 hours

**Current State**:
- `/api/v1/auth/register` accepts `role: 'USER' | 'SELLER'`
- `/api/v1/auth/google` accepts `role: 'USER' | 'SELLER'`
- Login/signup logic assumes marketplace buyer/seller split

**Target State**:
- Remove `role` parameter from registration endpoints
- Auto-assign `OWNER` role on first business creation
- Registration flow: Email → Verify → Create Business → OWNER assigned

**Files to Modify**:
- [ ] `backend/src/app/modules/auth/auth.controller.ts`
  - Remove `role` from register/signupWithGoogle request bodies
  - Auto-create business with OWNER role on first signup
  
- [ ] `backend/src/app/modules/auth/auth.service.ts`
  - Update registration logic to auto-create tenant
  - Remove buyer/seller split logic
  - Create default OWNER user on business creation
  
- [ ] `backend/src/app/modules/auth/auth.routes.ts`
  - Update endpoint signatures
  - Remove role validation for SELLER

**Blockers**: Need to define default permission set for OWNER role

---

### P2.2: Frontend Auth Context Refactoring

**Status**: 🔴 Not Started  
**Priority**: Critical  
**Effort**: 4-5 hours

**Current State**:
- `auth-context.tsx` Line 11: User role type includes `'USER' | 'SELLER'`
- `register()` accepts `role: 'USER' | 'SELLER'` parameter
- Signup/login logic branches on role

**Target State**:
- User role type: `'OWNER' | 'MANAGER' | 'STAFF'`
- Remove role selection from registration
- Auto-assign OWNER on first business creation
- Redirect to onboarding after signup

**Files to Modify**:
- [ ] [frontend/src/context/auth-context.tsx](frontend/src/context/auth-context.tsx) - Line 11, 22, 24, 117, 171
  - Update `UserRole` type to `'OWNER' | 'MANAGER' | 'STAFF'`
  - Remove `role` parameter from `register()` and `signUpWithGoogle()`
  - Update default role handling
  
- [ ] [frontend/src/app/auth/signup/page.tsx](frontend/src/app/auth/signup/page.tsx) - Lines 19, 29, 54, 112, 224-236
  - Remove role state management
  - Remove "Buyer" vs "Seller" buttons
  - Replace with unified signup form
  - Update marketing copy from agriculture to ERP
  
- [ ] [frontend/src/app/auth/login/page.tsx](frontend/src/app/auth/login/page.tsx) - Lines 24, 43, 97-100, 118
  - Remove role-based redirect logic (SELLER check)
  - Remove agriculture-specific copy
  - Simplify to standard login flow

**Blockers**: Need backend API changes first

---

### P2.3: Role-Based Navigation Migration

**Status**: 🔴 Not Started  
**Priority**: High  
**Effort**: 3-4 hours

**Current State**:
- `callback/success/page.tsx` Line 38: Checks `role === 'SELLER'`
- `dashboard/layout.tsx` Line 18: Guards with `role === 'SELLER'`
- Navbar shows SELLER role

**Target State**:
- Navigation based on business creation status (onboarding)
- Menu driven by permissions, not roles
- Standard dashboard for all users

**Files to Modify**:
- [ ] [frontend/src/app/auth/callback/success/page.tsx](frontend/src/app/auth/callback/success/page.tsx) - Line 38, 82
  - Replace role check with business creation check
  - Update redirect to onboarding or dashboard
  - Update "syncing agricultural workspace" copy
  
- [ ] [frontend/src/app/dashboard/layout.tsx](frontend/src/app/dashboard/layout.tsx) - Line 18
  - Remove role check
  - Implement business access validation
  
- [ ] [frontend/src/components/home/navbar.tsx](frontend/src/components/home/navbar.tsx) - Line 181
  - Remove role display
  - Show business name instead
  
- [ ] [frontend/src/app/dashboard/profile/page.tsx](frontend/src/app/dashboard/profile/page.tsx) - Line 31, 139
  - Remove role selection/display for SELLER
  - Show user permissions instead

**Blockers**: None identified

---

## Phase 3: Marketplace Page Routes Removal

### P3.1: Remove Public Marketplace Pages

**Status**: 🔴 Not Started  
**Priority**: High  
**Effort**: 5-6 hours

**Pages to Delete**:
- [ ] `/farmers/[id]/page.tsx` - Farmer profile marketplace page
- [ ] `/shop/page.tsx` - Marketplace browse page
- [ ] `/shop/[id]/page.tsx` - Product detail from marketplace
- [ ] `/checkout/page.tsx` - Buyer checkout flow
- [ ] `/wishlist/page.tsx` - Product wishlist (consumer feature)
- [ ] `/search/page.tsx` - Marketplace search

**Impact Analysis**:
- Remove `FARMERS` mock data from [frontend/src/lib/mock-data.ts](frontend/src/lib/mock-data.ts) - Lines 167-200
- Remove wishlist/cart context if not reused in ERP inventory
- Update navigation links in home pages

**Files to Update After Deletion**:
- [ ] [frontend/src/components/home/hero-banner.tsx](frontend/src/components/home/hero-banner.tsx) - Line 86-89
  - Remove "Meet farmers" link
  
- [ ] [frontend/src/components/home/footer.tsx](frontend/src/components/home/footer.tsx) - Lines 105, 106
  - Remove "Explore Marketplace" and "Our Certified Farmers" links
  
- [ ] [frontend/src/app/page.tsx](frontend/src/app/page.tsx) - Home landing page
  - Update CTA from marketplace exploration to signup/trial

**Blockers**: None identified

---

### P3.2: Remove Marketplace-Specific Routes from Backend

**Status**: 🔴 Not Started  
**Priority**: High  
**Effort**: 4-5 hours

**Current State**:
- Orders module handles "buyer orders" with marketplace semantics
- Reviews module implements buyer review system
- Products module has public listing endpoints

**Target State**:
- Orders: Business → Customer sales orders
- Reviews: Customer feedback (not marketplace vendor reviews)
- Products: Business inventory management (not public marketplace)

**Files to Refactor**:
- [ ] [backend/src/app/modules/orders/](backend/src/app/modules/orders/)
  - Remove marketplace order concepts
  - Reframe as business sales orders
  - Ensure businessId filtering
  
- [ ] [backend/src/app/modules/reviews/](backend/src/app/modules/reviews/)
  - Reframe as customer feedback (not marketplace)
  - Link reviews to business, not vendor
  
- [ ] [backend/src/app/modules/products/product.routes.ts](backend/src/app/modules/products/product.routes.ts)
  - Remove public product listing endpoints
  - Ensure all product access requires business context

**Blockers**: Need to clarify if Orders/Reviews modules are retained as ERP features

---

## Phase 4: UI Component Refactoring

### P4.1: Remove Marketplace Components

**Status**: 🔴 Not Started  
**Priority**: Medium  
**Effort**: 6-8 hours

**Components to Delete or Refactor**:
- [ ] [frontend/src/components/marketplace/](frontend/src/components/marketplace/) - Entire directory
  - `product-card.tsx` - Marketplace product card
  - `product-section.tsx` - Marketplace section layout
  - `marketplace-home.tsx` - Marketplace landing
  - `data.ts` - Featured products mock data
  
- [ ] [frontend/src/components/home/featured-farmers.tsx](frontend/src/components/home/featured-farmers.tsx) - Lines 7, 38, 44, 67, 93
  - Delete entirely (farmer marketplace concept)
  
- [ ] [frontend/src/components/home/hero-banner.tsx](frontend/src/components/home/hero-banner.tsx) - Line 66
  - Update copy: "AgriQon connects buyers with growers" → "AgriQon manages your business"
  
- [ ] [frontend/src/components/home/navbar.tsx](frontend/src/components/home/navbar.tsx) - Line 97
  - Update branding references

**Components to Repurpose**:
- [ ] [frontend/src/components/ui/product-card.tsx](frontend/src/components/ui/product-card.tsx) - Line 15, 117
  - Remove `vendor` field
  - Adapt for inventory/SKU display (ERP context)
  
- [ ] [frontend/src/components/dashboard/marketplace-view.tsx](frontend/src/components/dashboard/marketplace-view.tsx) - Lines 19, 24, 52-63
  - Refactor or delete (seller marketplace concept)
  - Replace with ERP dashboard view

**Blockers**: Need clarity on which components serve ERP functions

---

### P4.2: Update Dashboard Layout & Navigation

**Status**: 🔴 Not Started  
**Priority**: High  
**Effort**: 4-5 hours

**Current State**:
- Sidebar includes "Marketplace HQ" plan [frontend/src/components/app-sidebar.tsx](frontend/src/components/app-sidebar.tsx) - Line 52
- Sidebar has "Marketplace" navigation item - Line 77
- Dashboard layout assumes seller marketplace context

**Target State**:
- Sidebar shows ERP module list (Inventory, Orders, Customers, Reports, etc.)
- Plans show subscription tier names, not marketplace references
- Dashboard aggregates ERP KPIs

**Files to Modify**:
- [ ] [frontend/src/components/app-sidebar.tsx](frontend/src/components/app-sidebar.tsx) - Lines 52, 77
  - Replace "Marketplace HQ" with subscription tier
  - Replace "Marketplace" with relevant ERP modules
  - Update navigation structure
  
- [ ] [frontend/src/app/dashboard/page.tsx](frontend/src/app/dashboard/page.tsx)
  - Update dashboard widgets to show ERP metrics
  - Remove marketplace-specific widgets

**Blockers**: None identified

---

## Phase 5: Landing Page & Branding

### P5.1: Update Home Page Branding

**Status**: 🔴 Not Started  
**Priority**: High  
**Effort**: 5-6 hours

**Current State**:
- Landing page promotes agriculture, farmers, buyers
- Hero copy: "AgriQon connects buyers with verified growers, fresh inventory..."
- Footer: "Revolutionizing the agricultural landscape"
- Navbar branding focused on AgriQon marketplace

**Target State**:
- Branding: "Business Management ERP Platform"
- Hero: Position as all-in-one business OS
- Feature highlights: Inventory, Sales, Invoicing, CRM, Reports
- CTA: Get Started → Create Account → Start Free Trial

**Files to Modify**:
- [ ] [frontend/src/components/home/hero-banner.tsx](frontend/src/components/home/hero-banner.tsx) - Line 66
  - Update headline and supporting copy
  - Update CTA button
  
- [ ] [frontend/src/components/home/popular-products.tsx](frontend/src/components/home/popular-products.tsx) - Lines 40, 54, 121, 101
  - Rename to reflect ERP features or delete
  - Update "Explore Marketplace" to "Dashboard"
  
- [ ] [frontend/src/components/home/footer.tsx](frontend/src/components/home/footer.tsx) - Lines 77, 80, 105, 106, 177
  - Update company tagline
  - Remove marketplace/farmer links
  - Update copyright text
  
- [ ] [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx) - Line 23, 25
  - Update metadata: title and description
  - Change from "AI Agriculture Marketplace" to "Business ERP SaaS"
  
- [ ] [frontend/src/app/page.tsx](frontend/src/app/page.tsx)
  - Replace with ERP-focused landing page design

**Blockers**: Need new landing page copy/design

---

### P5.2: Update Documentation & Strategic Docs

**Status**: 🔴 Not Started  
**Priority**: Medium  
**Effort**: 4-5 hours

**Files to Update**:
- [ ] [frontend/AUTH-SETUP.md](frontend/AUTH-SETUP.md) - Line 91, 117-118
  - Remove "Buyer/Seller" references
  - Update to standard SaaS signup flow
  
- [ ] [frontend/AgriQon_Strategic_Build_Report.md](frontend/AgriQon_Strategic_Build_Report.md) - Lines 178, 415-423
  - Archive or mark as legacy
  - Create new ERP SaaS roadmap document
  
- [ ] [frontend/AgriQon_Dashboard_Implementation_Plan.md](frontend/AgriQon_Dashboard_Implementation_Plan.md) - Line 6, 45, 66, 317-321
  - Archive marketplace dashboard plan
  - Create ERP dashboard implementation plan
  
- [ ] [frontend/DESIGN-SYSTEM.md](frontend/DESIGN-SYSTEM.md) - Line 4, 494, 635, 676, 690
  - Update design reference away from marketplace
  - Update component specifications
  
- [ ] [backend/README.md](backend/README.md) - Line 3, 7-9
  - Update from "marketplace API" to "ERP API"
  - Update role descriptions
  
- [ ] [backend/docs/API_DOCUMENTATION.md](backend/docs/API_DOCUMENTATION.md) - Line 44, 79, 81, 112
  - Update role references
  - Update endpoint descriptions
  - Clarify business vs marketplace context

**Blockers**: None identified

---

## Phase 6: Mock Data & Config Cleanup

### P6.1: Remove Marketplace Mock Data

**Status**: 🔴 Not Started  
**Priority**: Low  
**Effort**: 2-3 hours

**Files to Modify**:
- [ ] [frontend/src/lib/mock-data.ts](frontend/src/lib/mock-data.ts) - Lines 10-200
  - Remove `vendors` array (Lines 167-200)
  - Update `products` array to remove vendor field
  - Replace agricultural items with generic examples
  
- [ ] [frontend/src/context/wishlist-context.tsx](frontend/src/context/wishlist-context.tsx) - Line 12, 31, 50
  - Remove vendor from wishlist items if not needed for ERP
  - Update localStorage key if repurposing

**Impact**:
- May affect any feature using vendor data
- Wishlist could be repurposed as ERP favorites (e.g., favorite products)

**Blockers**: Need to clarify if wishlist is retained for inventory management

---

### P6.2: Update Metadata & Configuration

**Status**: 🔴 Not Started  
**Priority**: Low  
**Effort**: 1-2 hours

**Files to Update**:
- [ ] [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx) - Line 23-25
  - Update page metadata (title, description)
  - Update favicon/branding if needed

**Blockers**: None identified

---

## Phase 7: Backend Template & Copy Updates

### P7.1: Update Notification Templates

**Status**: 🔴 Not Started  
**Priority**: Low  
**Effort**: 1-2 hours

**Files to Modify**:
- [ ] [backend/src/app/modules/notifications/notification.templates.ts](backend/src/app/modules/notifications/notification.templates.ts) - Line 58
  - Replace "Start exploring the marketplace today!" with ERP-appropriate message

**Blockers**: None identified

---

## Phase 8: Testing & Validation

### P8.1: Backend Auth Tests

**Status**: 🔴 Not Started  
**Priority**: Critical  
**Effort**: 4-5 hours

**Tests to Create/Update**:
- [ ] Verify registration creates OWNER role automatically
- [ ] Verify business is created on first signup
- [ ] Verify JWT includes correct role and permissions
- [ ] Verify SELLER role cannot be assigned
- [ ] Verify RLS policies block cross-tenant access

**Existing Test Files**:
- `backend/src/app/modules/auth/__tests__/`

**Blockers**: None identified

---

### P8.2: Frontend Auth Flow Tests

**Status**: 🔴 Not Started  
**Priority**: High  
**Effort**: 3-4 hours

**Manual Tests to Perform**:
- [ ] Signup flow creates business and auto-assigns OWNER
- [ ] Redirect after signup goes to onboarding (not marketplace)
- [ ] Login shows ERP dashboard (not marketplace)
- [ ] No role selection appears in signup
- [ ] Navigation reflects ERP modules, not marketplace

**Blockers**: None identified

---

### P8.3: Cross-Tenant Data Validation

**Status**: 🔴 Not Started  
**Priority**: Critical  
**Effort**: 2-3 hours

**Audit Scripts to Create**:
- [ ] Query to detect users with no businessId
- [ ] Query to detect duplicate SELLER roles
- [ ] Query to verify all business data has businessId
- [ ] Query to verify RLS policies are enabled

**Files to Create**:
- `backend/scratch/audit-cross-tenant-access.ts`
- `backend/scratch/validate-role-migration.ts`

**Blockers**: None identified

---

## Phase 9: Data Migration (if needed)

### P9.1: Migrate Existing Users to New Role Model

**Status**: 🟡 Pending Assessment  
**Priority**: High  
**Effort**: 2-3 hours (if needed)

**Assessment Required**:
- [ ] How many SELLER users currently in database?
- [ ] Should they convert to MANAGER or OWNER?
- [ ] Do they have associated businesses?
- [ ] What about USER role users?

**Migration Approach**:
```sql
-- Option 1: SELLER → MANAGER (for existing vendors)
UPDATE "User" SET "role" = 'MANAGER' 
WHERE "role" = 'SELLER' AND "businessId" IS NOT NULL;

-- Option 2: Backfill USER role with default business
INSERT INTO "Business" (...) 
SELECT DISTINCT "businessId" FROM "User" 
WHERE "role" = 'USER' AND "businessId" IS NULL;
```

**Blockers**: Unclear current data state (development DB vs production)

---

## Summary & Dependencies

### Critical Path (Must Complete First)

1. **P1.1**: Database role refactoring
2. **P2.1**: Backend auth endpoint migration
3. **P2.2**: Frontend auth context migration
4. **P8.1/P8.2**: Auth flow testing

### High Priority (Complete Next)

5. **P2.3**: Role-based navigation
6. **P3.1/P3.2**: Marketplace page removal
7. **P4.2**: Dashboard layout update
8. **P5.1**: Landing page branding

### Medium Priority (Complete After)

9. **P4.1**: Component cleanup
10. **P5.2**: Documentation updates

### Low Priority (Optional/Polish)

11. **P6/P7**: Mock data and copy updates

---

## Rollback Strategy

If migration needs to be reversed:

1. **Database**: Keep role enum backward compatible (add new values, don't delete)
2. **Frontend**: Feature flag marketplace pages (don't delete routes)
3. **API**: Versioning allows old endpoints to coexist
4. **Tests**: Maintain tests for both old and new flows during transition

---

## Metrics & Success Criteria

### Phase Completion Criteria

- [ ] All SELLER references removed from codebase
- [ ] No "marketplace" terminology in user-facing content
- [ ] Auth flow assigns OWNER automatically
- [ ] All routes require businessId context
- [ ] Frontend reflects ERP modules, not marketplace
- [ ] All tests pass with new role model
- [ ] Documentation reflects ERP positioning

### Code Quality Gates

- [ ] Zero references to buyer/seller/vendor in production code
- [ ] 100% of business-scoped queries include businessId filter
- [ ] All auth tests pass
- [ ] Linting passes (no agriculture-specific copy)

---

## Notes & References

- **Migration Plan**: [Project Migraion.md](../Project%20Migraion.md)
- **Previous Marketplace Design**: [AgriQon_Strategic_Build_Report.md](../frontend/AgriQon_Strategic_Build_Report.md) (legacy)
- **API Endpoints**: [backend/docs/API_DOCUMENTATION.md](../backend/docs/API_DOCUMENTATION.md)

---

## Changelog

| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| 2026-06-05 | Planning | 🔴 Not Started | Migration tracker created; comprehensive audit completed |

