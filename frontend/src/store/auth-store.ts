import { create } from 'zustand';
import { AuthState, UserProfile } from '@/types/auth';
import { Permission, UserRole } from '@/types/permission';

interface AuthActions {
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

// Helper function to map backend dot-notation permission keys to frontend UPPER_SNAKE_CASE permission keys
function mapPermission(backPerm: string): Permission[] {
  const key = backPerm.toLowerCase();
  
  if (key === 'product.manage') {
    return ['PRODUCT_VIEW', 'PRODUCT_CREATE', 'PRODUCT_EDIT', 'PRODUCT_DELETE'];
  }
  if (key === 'product.update') {
    return ['PRODUCT_EDIT'];
  }
  if (key === 'inventory.manage') {
    return ['INVENTORY_VIEW', 'INVENTORY_ADJUST', 'INVENTORY_RESERVE'];
  }
  if (key === 'inventory.update') {
    return ['INVENTORY_ADJUST'];
  }
  if (key === 'stock-movement.manage') {
    return ['INVENTORY_VIEW', 'INVENTORY_ADJUST'];
  }
  if (key === 'stock-movement.create') {
    return ['INVENTORY_ADJUST'];
  }
  if (key === 'stock-movement.view') {
    return ['INVENTORY_VIEW'];
  }
  if (key === 'order.manage') {
    return ['ORDER_VIEW', 'ORDER_CREATE', 'ORDER_EDIT'];
  }
  if (key === 'order.update') {
    return ['ORDER_EDIT'];
  }
  if (key === 'invoice.manage') {
    return ['INVOICE_VIEW', 'INVOICE_CREATE'];
  }
  if (key === 'payment.manage') {
    return ['PAYMENT_VIEW', 'PAYMENT_PROCESS'];
  }
  if (key === 'payment.create') {
    return ['PAYMENT_PROCESS'];
  }
  if (key === 'accounting.manage') {
    return ['EXPENSE_VIEW', 'EXPENSE_CREATE'];
  }
  if (key === 'accounting.create') {
    return ['EXPENSE_CREATE'];
  }
  if (key === 'accounting.view') {
    return ['EXPENSE_VIEW'];
  }
  if (key === 'warehouse.manage') {
    return ['ORG_VIEW', 'ORG_MANAGE'];
  }
  if (key === 'warehouse.view') {
    return ['ORG_VIEW'];
  }
  if (key === 'team.manage') {
    return ['TEAM_VIEW', 'TEAM_MANAGE'];
  }
  if (key === 'team.view') {
    return ['TEAM_VIEW'];
  }
  if (key === 'business.manage') {
    return ['ORG_VIEW', 'ORG_MANAGE', 'SETTINGS_VIEW', 'SETTINGS_MANAGE'];
  }
  if (key === 'business.view') {
    return ['ORG_VIEW', 'SETTINGS_VIEW'];
  }
  if (key === 'business.update') {
    return ['ORG_MANAGE', 'SETTINGS_MANAGE'];
  }
  if (key === 'ai.view' || key === 'ai.chat_use' || key === 'ai.manage') {
    return ['AI_ACCESS'];
  }
  
  const standard = key.replace('.', '_').replace('-', '_').toUpperCase() as Permission;
  return [standard];
}

export function translateBackendUser(backendUser: any): UserProfile | null {
  if (!backendUser) return null;
  
  const rawRole = backendUser.businessRole || backendUser.role || 'STAFF';
  let role: UserRole = 'OPERATOR';
  if (rawRole === 'OWNER' || rawRole === 'SUPER_ADMIN') {
    role = 'OWNER';
  } else if (rawRole === 'MANAGER') {
    role = 'MANAGER';
  } else if (rawRole === 'ADMIN') {
    role = 'ADMIN';
  } else if (rawRole === 'SELLER') {
    role = 'SELLER';
  } else if (rawRole === 'VIEWER') {
    role = 'VIEWER';
  } else if (rawRole === 'OPERATOR') {
    role = 'OPERATOR';
  }
                         
  const rawPermissions: string[] = backendUser.permissions || [];
  const permissionsSet = new Set<Permission>();
  
  rawPermissions.forEach((p) => {
    mapPermission(p).forEach((mapped) => {
      permissionsSet.add(mapped);
    });
  });
  
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    avatarUrl: backendUser.avatarUrl || undefined,
    role,
    businessId: backendUser.businessId || null,
    permissions: Array.from(permissionsSet),
  };
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;
    if (user.role === 'OWNER') return true;
    return user.permissions.includes(permission);
  },
  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    return user.role === role;
  },
}));
