import { NavigationItem } from '@/types/navigation';

export const navigationRegistry: NavigationItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    permission: 'PRODUCT_VIEW', // Minimum read permission
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
      },
      {
        title: 'Roles',
        href: '/team/roles',
        permission: 'TEAM_MANAGE',
      },
      {
        title: 'Permissions',
        href: '/team/permissions',
        permission: 'TEAM_MANAGE',
      },
    ],
  },
  {
    title: 'Product Catalog',
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
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: 'ShoppingCart',
    permission: 'ORDER_VIEW',
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: 'FileText',
    permission: 'INVOICE_VIEW',
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: 'CreditCard',
    permission: 'PAYMENT_VIEW',
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: 'TrendingDown',
    permission: 'EXPENSE_VIEW',
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
    title: 'Settings',
    href: '/settings',
    icon: 'Settings',
    permission: 'SETTINGS_VIEW',
  },
];
