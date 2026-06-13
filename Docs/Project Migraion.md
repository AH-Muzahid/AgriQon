# AgriQon → ERP SaaS Platform Migration Directive

## Context

The project has undergone a major strategic pivot.

Previously, the platform was designed as an agriculture-focused marketplace with buyer/seller workflows, seller dashboards, and marketplace-oriented features.

That direction is no longer valid.

The marketplace concept, seller role, buyer role, product listing marketplace flow, and agriculture-specific assumptions must be removed from future planning.

We are now building a Multi-Tenant ERP SaaS Platform for SMEs and growing businesses.

The platform should be positioned as a business management operating system rather than a marketplace.

---

# New Product Vision

The platform is now a subscription-based ERP SaaS solution where businesses subscribe to a plan and use business management tools inside their own isolated workspace (tenant).

The primary goal is to help businesses manage:

* Inventory
* Products
* Warehouses
* Sales
* Customers
* Orders
* Invoices
* Payments
* Expenses
* Reporting

Future modules may include:

* CRM
* HRM
* Project Management
* Accounting
* AI Assistant
* Workflow Automation

The architecture must be ERP-first.

---

# Remove Legacy Marketplace Concepts

Completely remove or refactor any architecture, UI, routing, database assumptions, or terminology related to:

* Buyer
* Seller
* Marketplace
* Vendor Storefront
* Product Marketplace
* Public Product Listings
* Marketplace Orders
* Seller Dashboard
* Agriculture Marketplace Concepts

These concepts are no longer part of the product vision.

---

# New SaaS Business Model

The system follows a multi-tenant SaaS architecture.

Flow:

Visitor
→ Registration
→ Subscription Selection
→ Business Creation
→ ERP Workspace Access

Each business becomes its own isolated tenant.

All business data must remain scoped by businessId.

---

# Updated Authentication & RBAC Model

Remove legacy Seller role assumptions.

## Platform Level Role

SUPER_ADMIN

Responsibilities:

* Manage platform
* Manage subscriptions
* Manage businesses
* Platform monitoring
* Support operations

This role exists only for platform administrators.

---

## Business Roles

OWNER

* Created automatically during business registration
* Full business access
* Manage users
* Manage permissions
* Manage subscription

MANAGER

* Operational management access
* Cannot transfer ownership
* Cannot manage platform-level settings

STAFF

* Limited access
* Access controlled entirely through permissions

---

## Permission Based Access Control

Role count should remain minimal.

Use permission-driven authorization.

Examples:

* product.create
* product.update
* inventory.adjust
* order.create
* invoice.read
* payment.create
* report.view

Menus, pages, APIs, and actions should be permission-aware.

---

# New Registration Flow

Landing Page
→ Sign Up
→ Verify Email
→ Select Subscription Plan
→ Create Business
→ Auto Create Owner Role
→ Business Dashboard

New users should never select a role during registration.

The first user automatically becomes OWNER.

---

# Landing Page Direction

The landing page should no longer promote agriculture, farming, buyers, sellers, or marketplace trading.

Instead it should position the product as:

"Business Management ERP Platform"

Key messaging:

* Inventory Management
* Sales Management
* POS
* Invoicing
* Customer Management
* Warehouse Management
* Reporting & Analytics
* Multi-Tenant SaaS
* Secure Role-Based Access

The landing page should drive users toward:

Get Started
→ Create Account
→ Start Free Trial / Subscription

---

# MVP Scope

Phase 1 ERP Core

* Authentication
* Multi-Tenant Business Setup
* RBAC
* Products
* Categories
* Inventory
* Warehouses
* Customers
* Orders
* Invoices
* Payments
* Expenses
* Reports

Future modules should remain modular and extensible.

---

# Development Rule

Every future architectural decision must align with the ERP SaaS vision.

Do not reintroduce marketplace workflows, seller concepts, or agriculture-specific business logic unless explicitly requested in a future module.
