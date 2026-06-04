/**
 * Centralized permission key constants.
 *
 * Convention: <domain>.<action>
 *   domain  = product | inventory | order | customer | supplier | purchase |
 *             accounting | warehouse | report | audit | ai | brand | category |
 *             notification | loyalty | review | invoice | payment | reconciliation
 *   action  = view | create | update | delete | manage
 *
 * "manage" is a super-action that implies all CRUD on that domain.
 *
 * These keys MUST match the `Permission.key` values seeded in the database.
 * Do NOT scatter raw strings elsewhere — always reference this file.
 */

// ─── Product ─────────────────────────────────────────────────────────
export const PRODUCT_VIEW = 'product.view' as const;
export const PRODUCT_CREATE = 'product.create' as const;
export const PRODUCT_UPDATE = 'product.update' as const;
export const PRODUCT_DELETE = 'product.delete' as const;
export const PRODUCT_MANAGE = 'product.manage' as const;

// ─── Inventory ───────────────────────────────────────────────────────
export const INVENTORY_VIEW = 'inventory.view' as const;
export const INVENTORY_CREATE = 'inventory.create' as const;
export const INVENTORY_UPDATE = 'inventory.update' as const;
export const INVENTORY_DELETE = 'inventory.delete' as const;
export const INVENTORY_MANAGE = 'inventory.manage' as const;

// ─── Order ───────────────────────────────────────────────────────────
export const ORDER_VIEW = 'order.view' as const;
export const ORDER_CREATE = 'order.create' as const;
export const ORDER_UPDATE = 'order.update' as const;
export const ORDER_DELETE = 'order.delete' as const;
export const ORDER_MANAGE = 'order.manage' as const;

// ─── Customer ────────────────────────────────────────────────────────
export const CUSTOMER_VIEW = 'customer.view' as const;
export const CUSTOMER_CREATE = 'customer.create' as const;
export const CUSTOMER_UPDATE = 'customer.update' as const;
export const CUSTOMER_DELETE = 'customer.delete' as const;
export const CUSTOMER_MANAGE = 'customer.manage' as const;

// ─── Supplier ────────────────────────────────────────────────────────
export const SUPPLIER_VIEW = 'supplier.view' as const;
export const SUPPLIER_CREATE = 'supplier.create' as const;
export const SUPPLIER_UPDATE = 'supplier.update' as const;
export const SUPPLIER_DELETE = 'supplier.delete' as const;
export const SUPPLIER_MANAGE = 'supplier.manage' as const;

// ─── Purchase ────────────────────────────────────────────────────────
export const PURCHASE_VIEW = 'purchase.view' as const;
export const PURCHASE_CREATE = 'purchase.create' as const;
export const PURCHASE_UPDATE = 'purchase.update' as const;
export const PURCHASE_DELETE = 'purchase.delete' as const;
export const PURCHASE_MANAGE = 'purchase.manage' as const;

// ─── Accounting ──────────────────────────────────────────────────────
export const ACCOUNTING_VIEW = 'accounting.view' as const;
export const ACCOUNTING_CREATE = 'accounting.create' as const;
export const ACCOUNTING_UPDATE = 'accounting.update' as const;
export const ACCOUNTING_DELETE = 'accounting.delete' as const;
export const ACCOUNTING_MANAGE = 'accounting.manage' as const;

// ─── Warehouse ───────────────────────────────────────────────────────
export const WAREHOUSE_VIEW = 'warehouse.view' as const;
export const WAREHOUSE_CREATE = 'warehouse.create' as const;
export const WAREHOUSE_UPDATE = 'warehouse.update' as const;
export const WAREHOUSE_DELETE = 'warehouse.delete' as const;
export const WAREHOUSE_MANAGE = 'warehouse.manage' as const;

// ─── Stock Movement ──────────────────────────────────────────────────
export const STOCK_MOVEMENT_VIEW = 'stock-movement.view' as const;
export const STOCK_MOVEMENT_CREATE = 'stock-movement.create' as const;
export const STOCK_MOVEMENT_MANAGE = 'stock-movement.manage' as const;

// ─── Report ──────────────────────────────────────────────────────────
export const REPORT_VIEW = 'report.view' as const;
export const REPORT_MANAGE = 'report.manage' as const;

// ─── Audit ───────────────────────────────────────────────────────────
export const AUDIT_VIEW = 'audit.view' as const;
export const AUDIT_MANAGE = 'audit.manage' as const;

// ─── AI ──────────────────────────────────────────────────────────────
export const AI_VIEW = 'ai.view' as const;
export const AI_MANAGE = 'ai.manage' as const;

// ─── Brand ───────────────────────────────────────────────────────────
export const BRAND_VIEW = 'brand.view' as const;
export const BRAND_CREATE = 'brand.create' as const;
export const BRAND_UPDATE = 'brand.update' as const;
export const BRAND_DELETE = 'brand.delete' as const;
export const BRAND_MANAGE = 'brand.manage' as const;

// ─── Category ────────────────────────────────────────────────────────
export const CATEGORY_VIEW = 'category.view' as const;
export const CATEGORY_CREATE = 'category.create' as const;
export const CATEGORY_UPDATE = 'category.update' as const;
export const CATEGORY_DELETE = 'category.delete' as const;
export const CATEGORY_MANAGE = 'category.manage' as const;

// ─── Notification ────────────────────────────────────────────────────
export const NOTIFICATION_VIEW = 'notification.view' as const;
export const NOTIFICATION_MANAGE = 'notification.manage' as const;

// ─── Loyalty ─────────────────────────────────────────────────────────
export const LOYALTY_VIEW = 'loyalty.view' as const;
export const LOYALTY_CREATE = 'loyalty.create' as const;
export const LOYALTY_MANAGE = 'loyalty.manage' as const;

// ─── Review ──────────────────────────────────────────────────────────
export const REVIEW_VIEW = 'review.view' as const;
export const REVIEW_CREATE = 'review.create' as const;
export const REVIEW_DELETE = 'review.delete' as const;
export const REVIEW_MANAGE = 'review.manage' as const;

// ─── Invoice ─────────────────────────────────────────────────────────
export const INVOICE_VIEW = 'invoice.view' as const;
export const INVOICE_CREATE = 'invoice.create' as const;
export const INVOICE_MANAGE = 'invoice.manage' as const;

// ─── Payment ─────────────────────────────────────────────────────────
export const PAYMENT_VIEW = 'payment.view' as const;
export const PAYMENT_CREATE = 'payment.create' as const;
export const PAYMENT_MANAGE = 'payment.manage' as const;

// ─── Reconciliation ──────────────────────────────────────────────────
export const RECONCILIATION_VIEW = 'reconciliation.view' as const;
export const RECONCILIATION_MANAGE = 'reconciliation.manage' as const;

// ─── Business ────────────────────────────────────────────────────────
export const BUSINESS_VIEW = 'business.view' as const;
export const BUSINESS_UPDATE = 'business.update' as const;
export const BUSINESS_MANAGE = 'business.manage' as const;

// ─── Upload ──────────────────────────────────────────────────────────
export const UPLOAD_CREATE = 'upload.create' as const;

// ─────────────────────────────────────────────────────────────────────
// Union type for compile‑time safety when referencing permission keys.
// ─────────────────────────────────────────────────────────────────────
export type PermissionKey =
  | typeof PRODUCT_VIEW | typeof PRODUCT_CREATE | typeof PRODUCT_UPDATE | typeof PRODUCT_DELETE | typeof PRODUCT_MANAGE
  | typeof INVENTORY_VIEW | typeof INVENTORY_CREATE | typeof INVENTORY_UPDATE | typeof INVENTORY_DELETE | typeof INVENTORY_MANAGE
  | typeof ORDER_VIEW | typeof ORDER_CREATE | typeof ORDER_UPDATE | typeof ORDER_DELETE | typeof ORDER_MANAGE
  | typeof CUSTOMER_VIEW | typeof CUSTOMER_CREATE | typeof CUSTOMER_UPDATE | typeof CUSTOMER_DELETE | typeof CUSTOMER_MANAGE
  | typeof SUPPLIER_VIEW | typeof SUPPLIER_CREATE | typeof SUPPLIER_UPDATE | typeof SUPPLIER_DELETE | typeof SUPPLIER_MANAGE
  | typeof PURCHASE_VIEW | typeof PURCHASE_CREATE | typeof PURCHASE_UPDATE | typeof PURCHASE_DELETE | typeof PURCHASE_MANAGE
  | typeof ACCOUNTING_VIEW | typeof ACCOUNTING_CREATE | typeof ACCOUNTING_UPDATE | typeof ACCOUNTING_DELETE | typeof ACCOUNTING_MANAGE
  | typeof WAREHOUSE_VIEW | typeof WAREHOUSE_CREATE | typeof WAREHOUSE_UPDATE | typeof WAREHOUSE_DELETE | typeof WAREHOUSE_MANAGE
  | typeof STOCK_MOVEMENT_VIEW | typeof STOCK_MOVEMENT_CREATE | typeof STOCK_MOVEMENT_MANAGE
  | typeof REPORT_VIEW | typeof REPORT_MANAGE
  | typeof AUDIT_VIEW | typeof AUDIT_MANAGE
  | typeof AI_VIEW | typeof AI_MANAGE
  | typeof BRAND_VIEW | typeof BRAND_CREATE | typeof BRAND_UPDATE | typeof BRAND_DELETE | typeof BRAND_MANAGE
  | typeof CATEGORY_VIEW | typeof CATEGORY_CREATE | typeof CATEGORY_UPDATE | typeof CATEGORY_DELETE | typeof CATEGORY_MANAGE
  | typeof NOTIFICATION_VIEW | typeof NOTIFICATION_MANAGE
  | typeof LOYALTY_VIEW | typeof LOYALTY_CREATE | typeof LOYALTY_MANAGE
  | typeof REVIEW_VIEW | typeof REVIEW_CREATE | typeof REVIEW_DELETE | typeof REVIEW_MANAGE
  | typeof INVOICE_VIEW | typeof INVOICE_CREATE | typeof INVOICE_MANAGE
  | typeof PAYMENT_VIEW | typeof PAYMENT_CREATE | typeof PAYMENT_MANAGE
  | typeof RECONCILIATION_VIEW | typeof RECONCILIATION_MANAGE
  | typeof BUSINESS_VIEW | typeof BUSINESS_UPDATE | typeof BUSINESS_MANAGE
  | typeof UPLOAD_CREATE;

/**
 * Full catalog of all permission keys, used by the seed script
 * to provision the Permission table.
 */
export const ALL_PERMISSION_KEYS: ReadonlyArray<{ key: PermissionKey; description: string }> = [
  // Product
  { key: PRODUCT_VIEW, description: 'View products' },
  { key: PRODUCT_CREATE, description: 'Create products' },
  { key: PRODUCT_UPDATE, description: 'Update products' },
  { key: PRODUCT_DELETE, description: 'Delete products' },
  { key: PRODUCT_MANAGE, description: 'Full product management' },
  // Inventory
  { key: INVENTORY_VIEW, description: 'View inventory' },
  { key: INVENTORY_CREATE, description: 'Create inventory records' },
  { key: INVENTORY_UPDATE, description: 'Update inventory' },
  { key: INVENTORY_DELETE, description: 'Delete inventory records' },
  { key: INVENTORY_MANAGE, description: 'Full inventory management' },
  // Order
  { key: ORDER_VIEW, description: 'View orders' },
  { key: ORDER_CREATE, description: 'Create orders' },
  { key: ORDER_UPDATE, description: 'Update orders' },
  { key: ORDER_DELETE, description: 'Delete orders' },
  { key: ORDER_MANAGE, description: 'Full order management' },
  // Customer
  { key: CUSTOMER_VIEW, description: 'View customers' },
  { key: CUSTOMER_CREATE, description: 'Create customers' },
  { key: CUSTOMER_UPDATE, description: 'Update customers' },
  { key: CUSTOMER_DELETE, description: 'Delete customers' },
  { key: CUSTOMER_MANAGE, description: 'Full customer management' },
  // Supplier
  { key: SUPPLIER_VIEW, description: 'View suppliers' },
  { key: SUPPLIER_CREATE, description: 'Create suppliers' },
  { key: SUPPLIER_UPDATE, description: 'Update suppliers' },
  { key: SUPPLIER_DELETE, description: 'Delete suppliers' },
  { key: SUPPLIER_MANAGE, description: 'Full supplier management' },
  // Purchase
  { key: PURCHASE_VIEW, description: 'View purchase orders' },
  { key: PURCHASE_CREATE, description: 'Create purchase orders' },
  { key: PURCHASE_UPDATE, description: 'Update purchase orders' },
  { key: PURCHASE_DELETE, description: 'Delete purchase orders' },
  { key: PURCHASE_MANAGE, description: 'Full purchase management' },
  // Accounting
  { key: ACCOUNTING_VIEW, description: 'View accounting records' },
  { key: ACCOUNTING_CREATE, description: 'Create journal entries' },
  { key: ACCOUNTING_UPDATE, description: 'Update accounting records' },
  { key: ACCOUNTING_DELETE, description: 'Delete accounting records' },
  { key: ACCOUNTING_MANAGE, description: 'Full accounting management' },
  // Warehouse
  { key: WAREHOUSE_VIEW, description: 'View warehouses' },
  { key: WAREHOUSE_CREATE, description: 'Create warehouses' },
  { key: WAREHOUSE_UPDATE, description: 'Update warehouses' },
  { key: WAREHOUSE_DELETE, description: 'Delete warehouses' },
  { key: WAREHOUSE_MANAGE, description: 'Full warehouse management' },
  // Stock Movement
  { key: STOCK_MOVEMENT_VIEW, description: 'View stock movements' },
  { key: STOCK_MOVEMENT_CREATE, description: 'Create stock movements' },
  { key: STOCK_MOVEMENT_MANAGE, description: 'Full stock movement management' },
  // Report
  { key: REPORT_VIEW, description: 'View reports' },
  { key: REPORT_MANAGE, description: 'Full report management' },
  // Audit
  { key: AUDIT_VIEW, description: 'View audit logs' },
  { key: AUDIT_MANAGE, description: 'Full audit management' },
  // AI
  { key: AI_VIEW, description: 'Use AI features' },
  { key: AI_MANAGE, description: 'Full AI management' },
  // Brand
  { key: BRAND_VIEW, description: 'View brands' },
  { key: BRAND_CREATE, description: 'Create brands' },
  { key: BRAND_UPDATE, description: 'Update brands' },
  { key: BRAND_DELETE, description: 'Delete brands' },
  { key: BRAND_MANAGE, description: 'Full brand management' },
  // Category
  { key: CATEGORY_VIEW, description: 'View categories' },
  { key: CATEGORY_CREATE, description: 'Create categories' },
  { key: CATEGORY_UPDATE, description: 'Update categories' },
  { key: CATEGORY_DELETE, description: 'Delete categories' },
  { key: CATEGORY_MANAGE, description: 'Full category management' },
  // Notification
  { key: NOTIFICATION_VIEW, description: 'View notifications' },
  { key: NOTIFICATION_MANAGE, description: 'Full notification management' },
  // Loyalty
  { key: LOYALTY_VIEW, description: 'View loyalty programs' },
  { key: LOYALTY_CREATE, description: 'Award loyalty points' },
  { key: LOYALTY_MANAGE, description: 'Full loyalty management' },
  // Review
  { key: REVIEW_VIEW, description: 'View reviews' },
  { key: REVIEW_CREATE, description: 'Create reviews' },
  { key: REVIEW_DELETE, description: 'Delete reviews' },
  { key: REVIEW_MANAGE, description: 'Full review management' },
  // Invoice
  { key: INVOICE_VIEW, description: 'View invoices' },
  { key: INVOICE_CREATE, description: 'Create invoices' },
  { key: INVOICE_MANAGE, description: 'Full invoice management' },
  // Payment
  { key: PAYMENT_VIEW, description: 'View payments' },
  { key: PAYMENT_CREATE, description: 'Create payments' },
  { key: PAYMENT_MANAGE, description: 'Full payment management' },
  // Reconciliation
  { key: RECONCILIATION_VIEW, description: 'View reconciliation' },
  { key: RECONCILIATION_MANAGE, description: 'Full reconciliation management' },
  // Business
  { key: BUSINESS_VIEW, description: 'View business settings' },
  { key: BUSINESS_UPDATE, description: 'Update business settings' },
  { key: BUSINESS_MANAGE, description: 'Full business management' },
  // Upload
  { key: UPLOAD_CREATE, description: 'Upload files' },
];

/**
 * Default role→permission mappings.
 *
 * OWNER  – full access to everything
 * MANAGER – operational workflows (inventory, customers, orders, products,
 *           reports, suppliers, purchases, warehouses, stock movements,
 *           brands, categories, loyalty, invoices, payments, notifications, AI)
 * STAFF  – basic read + create on day-to-day operations
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<'OWNER' | 'MANAGER' | 'STAFF', readonly PermissionKey[]> = {
  OWNER: ALL_PERMISSION_KEYS.map((p) => p.key),

  MANAGER: [
    // Products
    PRODUCT_VIEW, PRODUCT_CREATE, PRODUCT_UPDATE, PRODUCT_DELETE,
    // Inventory
    INVENTORY_VIEW, INVENTORY_CREATE, INVENTORY_UPDATE,
    // Orders
    ORDER_VIEW, ORDER_CREATE, ORDER_UPDATE,
    // Customers
    CUSTOMER_VIEW, CUSTOMER_CREATE, CUSTOMER_UPDATE,
    // Suppliers
    SUPPLIER_VIEW, SUPPLIER_CREATE, SUPPLIER_UPDATE,
    // Purchases
    PURCHASE_VIEW, PURCHASE_CREATE, PURCHASE_UPDATE,
    // Accounting (view + create only, not delete/manage)
    ACCOUNTING_VIEW, ACCOUNTING_CREATE,
    // Warehouses
    WAREHOUSE_VIEW, WAREHOUSE_CREATE, WAREHOUSE_UPDATE,
    // Stock Movements
    STOCK_MOVEMENT_VIEW, STOCK_MOVEMENT_CREATE,
    // Reports
    REPORT_VIEW,
    // Brands
    BRAND_VIEW, BRAND_CREATE, BRAND_UPDATE,
    // Categories
    CATEGORY_VIEW, CATEGORY_CREATE, CATEGORY_UPDATE,
    // Invoices
    INVOICE_VIEW, INVOICE_CREATE,
    // Payments
    PAYMENT_VIEW, PAYMENT_CREATE,
    // Loyalty
    LOYALTY_VIEW, LOYALTY_CREATE,
    // Notifications
    NOTIFICATION_VIEW,
    // AI
    AI_VIEW,
    // Reviews
    REVIEW_VIEW, REVIEW_DELETE,
    // Upload
    UPLOAD_CREATE,
  ],

  STAFF: [
    // Read-only + basic create for day-to-day
    PRODUCT_VIEW,
    INVENTORY_VIEW,
    ORDER_VIEW, ORDER_CREATE,
    CUSTOMER_VIEW, CUSTOMER_CREATE,
    WAREHOUSE_VIEW,
    STOCK_MOVEMENT_VIEW,
    BRAND_VIEW,
    CATEGORY_VIEW,
    INVOICE_VIEW,
    PAYMENT_VIEW, PAYMENT_CREATE,
    NOTIFICATION_VIEW,
    LOYALTY_VIEW,
    REVIEW_VIEW, REVIEW_CREATE,
    UPLOAD_CREATE,
  ],
};
