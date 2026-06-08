import {
  OrganizationContract,
  UpdateOrganizationInput,
  WarehouseContract,
  UserContract,
  RoleContract,
  AuditLogContract,
  SubscriptionUsageContract,
} from '@/types/contracts/organization.contract';
import { apiClient } from '../api/client';
import { MOCK_ROLES, MOCK_USERS, MOCK_SUBSCRIPTION_USAGE } from '@/lib/mock-erp-data';

export const organizationMock = {
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
        timezone: 'Asia/Dhaka (GMT+6)',
      };
    }
    return {
      id: biz.id,
      name: biz.name || 'AgriQon Corporation',
      slug: 'agriqon',
      email: biz.email || 'operations@agriqon.com',
      phone: biz.phone || '+880 2-9884432',
      address: biz.address || 'Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
      taxId: biz.taxNumber || 'BIN-882-990-1',
      currency: biz.currency || 'BDT (৳)',
      timezone: 'Asia/Dhaka (GMT+6)',
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
    };

    const updated = await apiClient.patch<any>(`/business/${biz.id}`, payload);
    return {
      id: updated.id,
      name: updated.name || 'AgriQon Corporation',
      slug: 'agriqon',
      email: updated.email || 'operations@agriqon.com',
      phone: updated.phone || '+880 2-9884432',
      address: updated.address || 'Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
      taxId: updated.taxNumber || 'BIN-882-990-1',
      currency: updated.currency || 'BDT (৳)',
      timezone: 'Asia/Dhaka (GMT+6)',
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
    return MOCK_USERS as any[] as UserContract[];
  },

  async listRoles(): Promise<RoleContract[]> {
    return MOCK_ROLES as any[] as RoleContract[];
  },

  async listAuditLogs(): Promise<AuditLogContract[]> {
    try {
      const logs = await apiClient.get<any[]>('/audit');
      return logs.map((log: any) => ({
        id: log.id,
        user: log.user?.name || 'System Operator',
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
    return MOCK_SUBSCRIPTION_USAGE as any as SubscriptionUsageContract;
  },
};
export default organizationMock;
