import {
  OrganizationContract,
  UpdateOrganizationInput,
  WarehouseContract,
  UserContract,
  RoleContract,
  AuditLogContract,
  SubscriptionUsageContract,
} from '@/types/contracts/organization.contract';
import { MOCK_WAREHOUSES, MOCK_USERS, MOCK_ROLES, MOCK_AUDIT_LOGS, MOCK_SUBSCRIPTION_USAGE } from '@/lib/mock-erp-data';

export const organizationMock = {
  async getDetails(): Promise<OrganizationContract> {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            id: 'org_agriqon',
            name: 'AgriQon Corporation',
            slug: 'agriqon',
            email: 'operations@agriqon.com',
            phone: '+880 2-9884432',
            address: 'Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
            taxId: 'BIN-882-990-1',
            currency: 'BDT (৳)',
            timezone: 'Asia/Dhaka (GMT+6)',
          }),
        100
      )
    );
  },

  async updateDetails(input: UpdateOrganizationInput): Promise<OrganizationContract> {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            id: 'org_agriqon',
            name: input.name || 'AgriQon Corporation',
            slug: input.slug || 'agriqon',
            email: input.email || 'operations@agriqon.com',
            phone: input.phone || '+880 2-9884432',
            address: input.address || 'Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
            taxId: input.taxId || 'BIN-882-990-1',
            currency: input.currency || 'BDT (৳)',
            timezone: input.timezone || 'Asia/Dhaka (GMT+6)',
          }),
        100
      )
    );
  },

  async listWarehouses(): Promise<WarehouseContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_WAREHOUSES as any[] as WarehouseContract[]), 100));
  },

  async listUsers(): Promise<UserContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_USERS as any[] as UserContract[]), 100));
  },

  async listRoles(): Promise<RoleContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_ROLES as any[] as RoleContract[]), 100));
  },

  async listAuditLogs(): Promise<AuditLogContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_AUDIT_LOGS as any[] as AuditLogContract[]), 100));
  },

  async getSubscriptionUsage(): Promise<SubscriptionUsageContract> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(MOCK_SUBSCRIPTION_USAGE as any as SubscriptionUsageContract), 100)
    );
  },
};
export default organizationMock;
