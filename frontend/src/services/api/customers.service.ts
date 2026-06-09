import { CustomerContract, CreateCustomerInput, UpdateCustomerInput } from '@/types/contracts/customer.contract';
import { apiClient } from './client';

export const customersService = {
  async list(): Promise<CustomerContract[]> {
    const res = await apiClient.client.get('/customers?limit=100');
    const body = res.data || {};
    const items = body.data || [];

    return items.map((c: any) => {
      // Documenting missing backend aggregate endpoints:
      // Currently, GET /customers returns the customer entity along with nested orders and invoices.
      // We calculate aggregates (purchasesCount, totalSpent, dueAmount) client-side in this service.
      const purchasesCount = c.orders?.length || 0;
      const totalSpent = c.orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0) || 0;
      const dueAmount = c.invoices?.reduce((sum: number, inv: any) => sum + Number(inv.dueAmount || 0), 0) || 0;

      return {
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        address: c.address || '',
        purchasesCount,
        totalSpent,
        dueAmount,
        status: c.deletedAt ? 'INACTIVE' : 'ACTIVE',
        timeline: [],
      };
    });
  },

  async getById(id: string): Promise<CustomerContract | null> {
    try {
      const res = await apiClient.client.get(`/customers/${id}`);
      const body = res.data || {};
      const c = body.data || body;
      if (!c) return null;

      const purchasesCount = c.orders?.length || 0;
      const totalSpent = c.orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0) || 0;
      const dueAmount = c.invoices?.reduce((sum: number, inv: any) => sum + Number(inv.dueAmount || 0), 0) || 0;

      return {
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        address: c.address || '',
        purchasesCount,
        totalSpent,
        dueAmount,
        status: c.deletedAt ? 'INACTIVE' : 'ACTIVE',
        timeline: (c.orders || []).map((o: any) => ({
          date: new Date(o.createdAt).toLocaleDateString(),
          event: `Placed order ${o.id.slice(0, 8).toUpperCase()} for BDT ${o.totalAmount}`,
          type: 'order',
        })),
      };
    } catch {
      const list = await this.list();
      return list.find((item) => item.id === id) || null;
    }
  },

  async create(input: CreateCustomerInput): Promise<CustomerContract> {
    const res = await apiClient.post<any>('/customers', {
      name: input.name,
      email: input.email || undefined,
      phone: input.phone || undefined,
      address: input.address || undefined,
    });

    return {
      id: res.id,
      name: res.name,
      email: res.email || '',
      phone: res.phone || '',
      address: res.address || '',
      purchasesCount: 0,
      totalSpent: 0,
      dueAmount: 0,
      status: 'ACTIVE',
      timeline: [],
    };
  },

  async update(id: string, input: UpdateCustomerInput): Promise<CustomerContract> {
    const res = await apiClient.patch<any>(`/customers/${id}`, {
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
    });

    return {
      id: res.id,
      name: res.name,
      email: res.email || '',
      phone: res.phone || '',
      address: res.address || '',
      purchasesCount: res.orders?.length || 0,
      totalSpent: res.orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0) || 0,
      dueAmount: res.invoices?.reduce((sum: number, inv: any) => sum + Number(inv.dueAmount || 0), 0) || 0,
      status: 'ACTIVE',
      timeline: [],
    };
  },

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/customers/${id}`);
    return true;
  },
};
export default customersService;
