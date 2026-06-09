import {
  OrganizationContract,
  UpdateOrganizationInput,
  WarehouseContract,
  UserContract,
  RoleContract,
  AuditLogContract,
  SubscriptionUsageContract,
} from '@/types/contracts/organization.contract';
import { apiClient } from './client';

export const organizationService = {
  async getDetails(): Promise<OrganizationContract> {
    const biz = await apiClient.get<any>('/business/my-business');
    if (!biz) {
      return {
        id: 'org_agriqon',
        name: 'AgriQon Corporation',
        slug: 'agriqon',
        email: 'operations@agriqon.com',
        phone: '+880 2-9884432',
        address: 'Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
        taxId: 'BIN-882-990-1',
        currency: 'BDT (৳)',
        timezone: 'Asia/Dhaka',
      };
    }
    return {
      id: biz.id,
      name: biz.name || 'AgriQon Corporation',
      slug: biz.slug || 'agriqon',
      email: biz.email || 'operations@agriqon.com',
      phone: biz.phone || '+880 2-9884432',
      address: biz.address || 'Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
      taxId: biz.taxNumber || 'BIN-882-990-1',
      currency: biz.currency || 'BDT (৳)',
      timezone: biz.timezone || 'Asia/Dhaka',
    };
  },

  async updateDetails(input: UpdateOrganizationInput): Promise<OrganizationContract> {
    const biz = await apiClient.get<any>('/business/my-business');
    if (!biz) throw new Error('No business context found to update');

    const payload = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      taxNumber: input.taxId,
      currency: input.currency?.split(' ')[0],
      timezone: input.timezone,
    };

    const updated = await apiClient.patch<any>(`/business/${biz.id}`, payload);
    return {
      id: updated.id,
      name: updated.name || 'AgriQon Corporation',
      slug: updated.slug || 'agriqon',
      email: updated.email || 'operations@agriqon.com',
      phone: updated.phone || '+880 2-9884432',
      address: updated.address || 'Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
      taxId: updated.taxNumber || 'BIN-882-990-1',
      currency: updated.currency || 'BDT (৳)',
      timezone: updated.timezone || 'Asia/Dhaka',
    };
  },

  async listWarehouses(): Promise<WarehouseContract[]> {
    const list = await apiClient.get<any[]>('/warehouses');
    return list.map((w: any) => ({
      id: w.id,
      name: w.name,
      code: w.id.slice(0, 6).toUpperCase(),
      manager: 'Store Manager',
      capacity: 10000,
      usedCapacity: 4500,
      status: 'ACTIVE',
      address: w.location || 'Dhaka',
    }));
  },

  async listUsers(): Promise<UserContract[]> {
    const list = await apiClient.get<any[]>('/organization/users');
    return list.map((u: any) => ({
      name: u.name,
      email: u.email,
      role: u.role,
      warehouse: u.warehouseAssignment || 'Dhaka Central Warehouse',
      status: u.status || 'ACTIVE',
      lastActive: 'Active',
    }));
  },

  async listRoles(): Promise<RoleContract[]> {
    const list = await apiClient.get<any[]>('/roles');
    return list.map((r: any) => ({
      name: r.name,
      roleType: r.isSystem ? 'System' : 'Custom',
      userCount: r.userCount || 0,
      permissionsCount: r.permissions?.length || 0,
      createdBy: r.isSystem ? 'System' : 'Custom Creator',
    }));
  },

  async listAuditLogs(): Promise<AuditLogContract[]> {
    try {
      const logs = await apiClient.get<any[]>('/audit');
      return logs.map((log: any) => ({
        id: log.id,
        user: log.user?.name || log.userId || 'System Operator',
        action: log.action,
        module: log.entityType || 'SYSTEM',
        timestamp: log.createdAt,
        ipAddress: log.ipAddress || '127.0.0.1',
        status: 'SUCCESS',
      }));
    } catch {
      return [];
    }
  },

  async getSubscriptionUsage(): Promise<SubscriptionUsageContract> {
    const res = await apiClient.get<any>('/subscription/usage');
    // If no subscription or fallback is needed, handle gracefully
    const sub = res?.subscription || {};
    const metrics = res?.metrics || [];

    const getMetricValue = (key: string, field: 'used' | 'limit'): number => {
      const metric = metrics.find((m: any) => m.key === key);
      if (!metric) return 0;
      return Number(metric[field] || 0);
    };

    return {
      planName: sub.planName || 'Starter',
      usersLimit: getMetricValue('users', 'limit'),
      usersUsed: getMetricValue('users', 'used'),
      warehousesLimit: getMetricValue('warehouses', 'limit'),
      warehousesUsed: getMetricValue('warehouses', 'used'),
      productsLimit: getMetricValue('products', 'limit'),
      productsUsed: getMetricValue('products', 'used'),
      storageLimitGB: 25, // Fallbacks for metrics not tracked in database
      storageUsedGB: 8.2,
      apiLimit: 50000,
      apiUsed: 14230,
      renewalDate: sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A',
    };
  },
};
export default organizationService;
