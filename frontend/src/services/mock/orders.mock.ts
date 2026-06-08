import { OrderContract, CreateOrderInput } from '@/types/contracts/order.contract';
import { apiClient } from '../api/client';

export const ordersMock = {
  async list(): Promise<OrderContract[]> {
    const res = await apiClient.get<any>('/orders?limit=100');
    const items = res.items || [];
    return items.map((o: any) => ({
      id: o.id,
      date: o.createdAt,
      customerId: o.customerId || '',
      customerName: o.customer?.name || 'Walk-in Customer',
      totalAmount: Number(o.totalAmount || 0),
      status: o.status,
      items: (o.orderItems || []).map((oi: any) => ({
        sku: oi.item?.sku || oi.itemId,
        name: oi.item?.title || 'Unknown Item',
        qty: oi.quantity,
        price: Number(oi.unitPrice),
      })),
      timeline: [],
    }));
  },

  async getById(id: string): Promise<OrderContract | null> {
    try {
      const o = await apiClient.get<any>(`/orders/${id}`);
      if (o) {
        return {
          id: o.id,
          date: o.createdAt,
          customerId: o.customerId || '',
          customerName: o.customer?.name || 'Walk-in Customer',
          totalAmount: Number(o.totalAmount || 0),
          status: o.status,
          items: (o.orderItems || []).map((oi: any) => ({
            sku: oi.item?.sku || oi.itemId,
            name: oi.item?.title || 'Unknown Item',
            qty: oi.quantity,
            price: Number(oi.unitPrice),
          })),
          timeline: [],
        };
      }
    } catch {
      const list = await this.list();
      return list.find((item) => item.id === id) || null;
    }
    return null;
  },

  async create(input: CreateOrderInput): Promise<OrderContract> {
    const prodRes = await apiClient.get<any>('/products?limit=100');
    const products = prodRes.items || [];

    const warehouses = await apiClient.get<any[]>('/warehouses');
    const defaultWarehouseId = warehouses.length > 0 ? warehouses[0].id : '';

    const items = input.items.map((it) => {
      const prod = products.find((p: any) => p.sku === it.sku || p.id === it.sku);
      return {
        itemId: prod?.id || it.sku,
        warehouseId: defaultWarehouseId,
        quantity: it.qty,
        unitPrice: Number(prod?.price || 100),
        discount: 0,
        tax: 0,
      };
    });

    const payload = {
      customerId: input.customerId,
      items,
      discount: 0,
      taxAmount: 0,
      idempotencyKey: typeof window !== 'undefined' ? window.crypto.randomUUID() : 'c48c4976-37a9-4bbf-b6dc-a0c9e4d42045',
    };

    const res = await apiClient.post<any>('/orders', payload);
    return {
      id: res.id,
      date: res.createdAt,
      customerId: res.customerId || '',
      customerName: res.customer?.name || 'Customer',
      totalAmount: Number(res.totalAmount || 0),
      status: res.status,
      items: [],
      timeline: [],
    };
  },

  async update(id: string, input: any): Promise<OrderContract> {
    if (input.status) {
      let status = input.status;
      if (status === 'PROCESSING') status = 'CONFIRMED';
      const res = await apiClient.patch<any>(`/orders/${id}/status`, { status });
      return {
        id: res.id,
        date: res.createdAt,
        customerId: res.customerId || '',
        customerName: res.customer?.name || 'Customer',
        totalAmount: Number(res.totalAmount || 0),
        status: res.status,
        items: [],
        timeline: [],
      };
    }
    return this.getById(id) as any;
  },

  async delete(id: string): Promise<boolean> {
    await apiClient.patch(`/orders/${id}/cancel`);
    return true;
  },
};
export default ordersMock;
