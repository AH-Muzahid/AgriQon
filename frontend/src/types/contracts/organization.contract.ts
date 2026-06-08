export interface OrganizationContract {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  currency: string;
  timezone: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  currency?: string;
  timezone?: string;
}

export interface WarehouseContract {
  id: string;
  name: string;
  code: string;
  manager: string;
  capacity: number;
  usedCapacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  address: string;
}

export interface UserContract {
  name: string;
  email: string;
  role: string;
  warehouse: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  lastActive: string;
}

export interface RoleContract {
  name: string;
  roleType: 'System' | 'Custom';
  userCount: number;
  permissionsCount: number;
  createdBy: string;
}

export interface AuditLogContract {
  id: string;
  user: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface SubscriptionUsageContract {
  planName: 'Starter' | 'Growth' | 'Enterprise';
  usersLimit: number;
  usersUsed: number;
  warehousesLimit: number;
  warehousesUsed: number;
  productsLimit: number;
  productsUsed: number;
  storageLimitGB: number;
  storageUsedGB: number;
  apiLimit: number;
  apiUsed: number;
  renewalDate: string;
}
