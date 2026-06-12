import { Supplier, CreateSupplierInput, UpdateSupplierInput } from '@/types/contracts/supplier.contract';
import { apiClient } from './client';

export const suppliersService = {
  async list(): Promise<Supplier[]> {
    const res = await apiClient.client.get('/suppliers');
    const body = res.data || {};
    return body.data || [];
  },

  async getById(id: string): Promise<Supplier | null> {
    try {
      const res = await apiClient.client.get(`/suppliers/${id}`);
      const body = res.data || {};
      return body.data || body;
    } catch {
      return null;
    }
  },

  async create(input: CreateSupplierInput): Promise<Supplier> {
    const res = await apiClient.post<any>('/suppliers', input);
    const body = res.data || {};
    return body.data || body;
  },

  async update(id: string, input: UpdateSupplierInput): Promise<Supplier> {
    const res = await apiClient.patch<any>(`/suppliers/${id}`, input);
    const body = res.data || {};
    return body.data || body;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/suppliers/${id}`);
  },
};
