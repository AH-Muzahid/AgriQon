import { PurchaseOrder, CreatePurchaseInput } from '@/types/contracts/purchase.contract';
import { apiClient } from './client';

export const purchasesService = {
  async list(): Promise<PurchaseOrder[]> {
    const res = await apiClient.client.get('/purchases');
    const body = res.data || {};
    return body.data || [];
  },

  async getById(id: string): Promise<PurchaseOrder | null> {
    try {
      const res = await apiClient.client.get(`/purchases/${id}`);
      const body = res.data || {};
      return body.data || body;
    } catch {
      return null;
    }
  },

  async create(input: CreatePurchaseInput): Promise<PurchaseOrder> {
    const res = await apiClient.post<any>('/purchases', input);
    const body = res.data || {};
    return body.data || body;
  },

  async receive(id: string, warehouseId: string): Promise<PurchaseOrder> {
    const res = await apiClient.post<any>(`/purchases/${id}/receive`, { warehouseId });
    const body = res.data || {};
    return body.data || body;
  },

  async cancel(id: string): Promise<PurchaseOrder> {
    const res = await apiClient.post<any>(`/purchases/${id}/cancel`, {});
    const body = res.data || {};
    return body.data || body;
  },

  async pay(id: string): Promise<PurchaseOrder> {
    const res = await apiClient.post<any>(`/purchases/${id}/pay`, {});
    const body = res.data || {};
    return body.data || body;
  },
};
