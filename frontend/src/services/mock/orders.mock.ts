import { OrderContract, CreateOrderInput, UpdateOrderStatusInput } from '@/types/contracts/order.contract';
import { MOCK_ORDERS } from '@/lib/mock-erp-data';

export const ordersMock = {
  async list(): Promise<OrderContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_ORDERS as any[] as OrderContract[]), 100));
  },

  async getById(id: string): Promise<OrderContract | null> {
    return new Promise((resolve) => {
      const o = MOCK_ORDERS.find((item) => item.id === id);
      setTimeout(() => resolve((o as any as OrderContract) || null), 100);
    });
  },

  async create(input: CreateOrderInput): Promise<OrderContract> {
    return new Promise((resolve) => {
      const created: OrderContract = {
        id: `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString(),
        customerId: input.customerId,
        customerName: 'Mock Customer Profile',
        totalAmount: 12000,
        status: 'PENDING',
        items: [],
        timeline: [],
      };
      setTimeout(() => resolve(created), 100);
    });
  },

  async update(id: string, input: any): Promise<OrderContract> {
    return new Promise((resolve, reject) => {
      const o = MOCK_ORDERS.find((item) => item.id === id);
      if (!o) return reject(new Error('Order not found'));
      const updated: OrderContract = {
        ...(o as any as OrderContract),
        ...input,
      };
      setTimeout(() => resolve(updated), 100);
    });
  },

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 100));
  },
};
export default ordersMock;
