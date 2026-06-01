# AgriQon Dashboard Implementation Plan

## Production Ready Frontend Roadmap

### Goal
Build Seller Dashboard + Customer Dashboard on top of the existing enterprise backend.

Existing backend modules:
- accounting
- ai
- analytics
- audit
- auth
- billing
- brands
- business
- categories
- customers
- events
- inventory
- invoices
- loyalty
- notifications
- orders
- payments
- permissions
- products
- purchases
- reconciliation
- reports
- reviews
- settings
- stock-movements
- subscriptions
- suppliers
- warehouse
- uploads

---

# Phase 1 (MVP)

Focus only on daily business operations.

## Seller Navigation

- Dashboard
- Products
- Inventory
- Orders
- POS
- Customers
- Purchases
- AI Assistant
- Reports
- Settings

Hide:
- Audit
- Accounting
- Reconciliation
- Advanced Analytics

---

# Seller Dashboard Home

## KPI Cards

- Today Sales
- Today Profit
- Pending Orders
- Low Stock
- Due Payments
- Active Customers

## Quick Actions

- New Sale
- Add Product
- Stock Entry
- Add Customer
- Create Purchase
- Ask AI

## AI Summary Widget

Natural language business summary.

---

# Products Module

Uses:
- products
- categories
- brands
- uploads

Pages:
- /products
- /products/create
- /products/[id]

Features:
- CRUD
- variants
- SKU
- barcode
- images
- categories

---

# Inventory Module

Uses:
- inventory
- warehouse
- stock-movements

Pages:
- /inventory
- /inventory/adjustment
- /inventory/transfers

Tabs:
- Overview
- Movements
- Transfers
- History

---

# Orders Module

Uses:
- orders
- invoices
- payments

Pages:
- /orders
- /orders/[id]

Features:
- order timeline
- payment status
- invoice status
- reservation status

---

# POS Module

Route:
- /pos

Layout:
Left = Product Grid
Right = Cart

Payment Buttons:
- Cash
- bKash
- Due

Offline Banner Support.

---

# Customers Module

Uses:
- customers
- loyalty
- reviews

Customer Profile:
- purchase history
- dues
- loyalty points
- reviews

---

# Purchases Module

Uses:
- purchases
- suppliers

Features:
- supplier management
- purchase orders
- stock receiving

---

# AI Assistant

Route:
- /ai-assistant

Suggested Questions:
- আজকে কত বিক্রি হয়েছে?
- কম স্টকে কী আছে?
- কার কাছে টাকা বাকি?

Future:
- Voice Input
- Messenger
- WhatsApp

---

# Reports

Uses:
- reports
- analytics

Exports:
- PDF
- Excel
- CSV

Reports:
- sales
- inventory
- customers
- payments

---

# Settings

Uses:
- business
- subscriptions
- permissions
- settings

Sections:
- business profile
- warehouses
- branches
- users
- roles
- notifications
- billing

---

# Phase 2

## Accounting

Uses:
- accounting
- payments
- reconciliation

Pages:
- /accounting

---

## Analytics

Uses:
- analytics

Pages:
- /analytics

---

## Audit

Uses:
- audit

Admin Only.

---

# Customer Dashboard

Separate experience.

Navigation:
- Home
- Categories
- Orders
- Wishlist
- Profile

Home Sections:
- Fresh Products
- Organic Products
- Best Sellers
- AI Search

Product Page:
- Images
- Seller Info
- Reviews
- Related Products

---

# Frontend Structure

src/
  app/
    seller/
    customer/

  components/
    seller/
    customer/
    ai/
    pos/
    shared/

  features/
    products/
    inventory/
    orders/
    customers/
    purchases/
    reports/
    ai/

---

# State Management

TanStack Query:
- server state

Zustand:
- UI state
- sidebar
- modals
- POS cart

---

# Design Rules

- Mobile First
- Bengali Friendly
- Large Buttons
- Minimal Clutter
- Conversational UX

Fonts:
- Hind Siliguri
- Noto Sans Bengali

---

# AI Agent Build Order

1. Layout System
2. Authentication
3. Dashboard Home
4. Products
5. Inventory
6. Orders
7. POS
8. Customers
9. Purchases
10. Reports
11. AI Assistant
12. Settings
13. Customer Storefront
14. Accounting
15. Analytics
16. Audit

---

# Final Principle

Frontend should feel simple.

Backend can remain enterprise-grade.
