import { NavigationItem } from '@/types/navigation';

export const navigationRegistry: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    permission: 'PRODUCT_VIEW',
  },
  {
    title: 'Organization',
    href: '/organization',
    icon: 'Building2',
    permission: 'ORG_VIEW',
    items: [
      {
        title: 'Profile',
        href: '/organization/profile',
        permission: 'ORG_VIEW',
      },
      {
        title: 'Warehouses',
        href: '/organization/warehouses',
        permission: 'INVENTORY_VIEW',
        quickCreate: {
          label: 'Register Warehouse',
          permission: 'ORG_MANAGE',
          icon: 'Warehouse',
        },
      },
    ],
  },
  {
    title: 'Team Management',
    href: '/team',
    icon: 'Users',
    permission: 'TEAM_VIEW',
    items: [
      {
        title: 'Users',
        href: '/team/users',
        permission: 'TEAM_VIEW',
        quickCreate: {
          label: 'Invite Member',
          permission: 'TEAM_MANAGE',
          icon: 'UserPlus',
        },
      },
      {
        title: 'Roles',
        href: '/team/roles',
        permission: 'TEAM_MANAGE',
        quickCreate: {
          label: 'Define Custom Role',
          permission: 'TEAM_MANAGE',
          icon: 'Shield',
        },
      },
      {
        title: 'Permissions',
        href: '/team/permissions',
        permission: 'TEAM_MANAGE',
      },
    ],
  },
  {
    title: 'Catalog',
    href: '/catalog',
    icon: 'BookOpen',
    permission: 'PRODUCT_VIEW',
    items: [
      {
        title: 'Categories',
        href: '/catalog/categories',
        permission: 'PRODUCT_VIEW',
      },
      {
        title: 'Products',
        href: '/catalog/products',
        permission: 'PRODUCT_VIEW',
        quickCreate: {
          label: 'Add Product SKU',
          permission: 'PRODUCT_CREATE',
          icon: 'PlusCircle',
        },
      },
    ],
  },
  {
    title: 'Inventory Control',
    href: '/inventory',
    icon: 'Boxes',
    permission: 'INVENTORY_VIEW',
    items: [
      {
        title: 'Stock Levels',
        href: '/inventory/stock',
        permission: 'INVENTORY_VIEW',
      },
      {
        title: 'Stock Movements',
        href: '/inventory/movements',
        permission: 'INVENTORY_VIEW',
      },
      {
        title: 'Adjustments',
        href: '/inventory/adjustments',
        permission: 'INVENTORY_ADJUST',
        quickCreate: {
          label: 'Log Stock Adjustment',
          permission: 'INVENTORY_ADJUST',
          icon: 'Sliders',
        },
      },
      {
        title: 'Reservations',
        href: '/inventory/reservations',
        permission: 'INVENTORY_RESERVE',
      },
    ],
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: 'Contact',
    permission: 'PRODUCT_VIEW',
    quickCreate: {
      label: 'Register Customer',
      permission: 'PRODUCT_CREATE',
      icon: 'UserPlus',
    },
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: 'ShoppingCart',
    permission: 'ORDER_VIEW',
    quickCreate: {
      label: 'New Sales Order',
      permission: 'ORDER_CREATE',
      icon: 'ShoppingBag',
    },
  },
  {
    title: 'Purchases',
    href: '/purchases',
    icon: 'Truck',
    permission: 'PURCHASE_VIEW',
    items: [
      {
        title: 'Purchase Orders',
        href: '/purchases',
        permission: 'PURCHASE_VIEW',
        quickCreate: {
          label: 'New Purchase Order',
          permission: 'PURCHASE_CREATE',
          icon: 'PlusCircle',
        },
      },
      {
        title: 'Suppliers',
        href: '/purchases/suppliers',
        permission: 'SUPPLIER_VIEW',
        quickCreate: {
          label: 'Register Supplier',
          permission: 'SUPPLIER_CREATE',
          icon: 'UserPlus',
        },
      },
    ],
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: 'FileText',
    permission: 'INVOICE_VIEW',
    quickCreate: {
      label: 'Issue Tax Invoice',
      permission: 'INVOICE_CREATE',
      icon: 'Receipt',
    },
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: 'CreditCard',
    permission: 'PAYMENT_VIEW',
    quickCreate: {
      label: 'Record Payment Entry',
      permission: 'PAYMENT_PROCESS',
      icon: 'DollarSign',
    },
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: 'TrendingDown',
    permission: 'EXPENSE_VIEW',
    quickCreate: {
      label: 'Log Expense Voucher',
      permission: 'EXPENSE_CREATE',
      icon: 'Scale',
    },
  },
  {
    title: 'Reports & Analytics',
    href: '/reports',
    icon: 'BarChart3',
    permission: 'REPORT_VIEW',
    items: [
      {
        title: 'Sales Reports',
        href: '/reports/sales',
        permission: 'REPORT_VIEW',
      },
      {
        title: 'Inventory Reports',
        href: '/reports/inventory',
        permission: 'REPORT_VIEW',
      },
      {
        title: 'Financial Reports',
        href: '/reports/financial',
        permission: 'REPORT_VIEW',
      },
    ],
  },
  {
    title: 'AgroAI Assistant',
    href: '/ai',
    icon: 'Sparkles',
    permission: 'AI_ACCESS',
  },
  {
    title: 'Subscription',
    href: '/subscription',
    icon: 'CreditCard',
    permission: 'ORG_VIEW',
    items: [
      {
        title: 'Plan Quotas',
        href: '/subscription',
        permission: 'ORG_VIEW',
      },
      {
        title: 'Billing & Invoices',
        href: '/subscription/billing',
        permission: 'ORG_VIEW',
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: 'Settings',
    permission: 'SETTINGS_VIEW',
    items: [
      {
        title: 'General',
        href: '/settings',
        permission: 'SETTINGS_VIEW',
      },
      {
        title: 'Billing & Plans',
        href: '/settings/billing',
        permission: 'SETTINGS_VIEW',
      },
      {
        title: 'Security',
        href: '/settings/security',
        permission: 'SETTINGS_VIEW',
      },
    ],
  },
];
