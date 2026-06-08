import { create } from 'zustand';
import { AuthState, UserProfile } from '@/types/auth';
import { Permission, UserRole } from '@/types/permission';

interface AuthActions {
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

// Phase 1 Mock User Profile
const MOCK_USER: UserProfile = {
  id: 'usr_mock123',
  email: 'admin@agroai-farm.com',
  name: 'Muzahid Agro Owner',
  avatarUrl: undefined, // Empty to trigger initials
  role: 'OWNER',
  businessId: 'biz_agro_hq',
  permissions: [
    'PRODUCT_VIEW',
    'PRODUCT_CREATE',
    'PRODUCT_EDIT',
    'PRODUCT_DELETE',
    'INVENTORY_VIEW',
    'INVENTORY_ADJUST',
    'INVENTORY_RESERVE',
    'ORDER_VIEW',
    'ORDER_CREATE',
    'ORDER_EDIT',
    'INVOICE_VIEW',
    'INVOICE_CREATE',
    'PAYMENT_VIEW',
    'PAYMENT_PROCESS',
    'EXPENSE_VIEW',
    'EXPENSE_CREATE',
    'REPORT_VIEW',
    'TEAM_VIEW',
    'TEAM_MANAGE',
    'ORG_VIEW',
    'ORG_MANAGE',
    'AI_ACCESS',
    'SETTINGS_VIEW',
    'SETTINGS_MANAGE',
  ],
};

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: MOCK_USER,
  isAuthenticated: true,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
  hasPermission: (permission) => {
    const user = get().user;
    if (!user) return false;
    // OWNER role automatically bypasses all permissions checks
    if (user.role === 'OWNER') return true;
    return user.permissions.includes(permission);
  },
  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    return user.role === role;
  },
}));
