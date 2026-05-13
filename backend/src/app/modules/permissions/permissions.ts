import { Role } from '../../../generated/client';

export enum Permission {
  // Products
  PRODUCTS_VIEW = 'products:view',
  PRODUCTS_CREATE = 'products:create',
  PRODUCTS_UPDATE = 'products:update',
  PRODUCTS_DELETE = 'products:delete',
  
  // Orders
  ORDERS_VIEW = 'orders:view',
  ORDERS_CREATE = 'orders:create',
  ORDERS_UPDATE = 'orders:update',
  ORDERS_CANCEL = 'orders:cancel',
  
  // Inventory
  INVENTORY_VIEW = 'inventory:view',
  INVENTORY_ADJUST = 'inventory:adjust',
  
  // Warehouses
  WAREHOUSE_VIEW = 'warehouse:view',
  WAREHOUSE_MANAGE = 'warehouse:manage',
  
  // Accounting
  ACCOUNTING_VIEW = 'accounting:view',
  ACCOUNTING_MANAGE = 'accounting:manage',
  
  // Customers
  CUSTOMERS_VIEW = 'customers:view',
  CUSTOMERS_MANAGE = 'customers:manage',
  
  // Suppliers
  SUPPLIERS_VIEW = 'suppliers:view',
  SUPPLIERS_MANAGE = 'suppliers:manage',
  
  // Reports
  REPORTS_VIEW = 'reports:view',
  
  // Settings
  SETTINGS_MANAGE = 'settings:manage',
  
  // AI
  AI_ACCESS = 'ai:access',
}

/**
 * Role-Permission Mapping
 * ──────────────────────────────────────────────────────────────────────────
 * This is the source of truth for the RBAC system.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: Object.values(Permission),
  
  MANAGER: [
    Permission.PRODUCTS_VIEW, Permission.PRODUCTS_CREATE, Permission.PRODUCTS_UPDATE,
    Permission.ORDERS_VIEW, Permission.ORDERS_UPDATE, Permission.ORDERS_CANCEL,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_ADJUST,
    Permission.WAREHOUSE_VIEW,
    Permission.CUSTOMERS_VIEW, Permission.CUSTOMERS_MANAGE,
    Permission.SUPPLIERS_VIEW, Permission.SUPPLIERS_MANAGE,
    Permission.REPORTS_VIEW,
    Permission.AI_ACCESS
  ],
  
  CASHIER: [
    Permission.PRODUCTS_VIEW,
    Permission.ORDERS_VIEW, Permission.ORDERS_CREATE,
    Permission.CUSTOMERS_VIEW, Permission.CUSTOMERS_MANAGE
  ],
  
  WAREHOUSE_KEEPER: [
    Permission.PRODUCTS_VIEW,
    Permission.INVENTORY_VIEW, Permission.INVENTORY_ADJUST,
    Permission.WAREHOUSE_VIEW,
    Permission.SUPPLIERS_VIEW
  ],
  
  ACCOUNTANT: [
    Permission.ACCOUNTING_VIEW,
    Permission.ORDERS_VIEW,
    Permission.REPORTS_VIEW
  ],
  
  SELLER: [
    Permission.PRODUCTS_VIEW, Permission.PRODUCTS_CREATE, Permission.PRODUCTS_UPDATE,
    Permission.ORDERS_VIEW, Permission.ORDERS_CREATE,
    Permission.INVENTORY_VIEW
  ],
  
  USER: [
    Permission.PRODUCTS_VIEW,
    Permission.ORDERS_VIEW
  ]
};

export const hasPermission = (role: Role, requiredPermission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(requiredPermission);
};
