import { InvoiceContract, CreateInvoiceInput } from '@/types/contracts/invoice.contract';
import { apiClient } from '../api/client';

export const invoicesMock = {
  async list(): Promise<InvoiceContract[]> {
    const items = await apiClient.get<any[]>('/invoices?limit=100');
    return items.map((inv: any) => ({
      id: inv.id,
      invoiceNo: inv.invoiceNumber,
      orderId: inv.orderId,
      customerName: inv.customer?.name || 'Walk-in Customer',
      date: inv.createdAt,
      dueDate: inv.dueDate,
      totalAmount: Number(inv.totalAmount || 0),
      paidAmount: Number(inv.paidAmount || 0),
      dueAmount: Number(inv.dueAmount || 0),
      status: Number(inv.dueAmount || 0) <= 0 
        ? 'PAID' 
        : Number(inv.paidAmount || 0) > 0 
          ? 'PARTIAL' 
          : new Date(inv.dueDate) < new Date() 
            ? 'OVERDUE' 
            : 'UNPAID',
    }));
  },

  async getById(id: string): Promise<InvoiceContract | null> {
    try {
      const inv = await apiClient.get<any>(`/invoices/${id}`);
      if (inv) {
        return {
          id: inv.id,
          invoiceNo: inv.invoiceNumber,
          orderId: inv.orderId,
          customerName: inv.customer?.name || 'Walk-in Customer',
          date: inv.createdAt,
          dueDate: inv.dueDate,
          totalAmount: Number(inv.totalAmount || 0),
          paidAmount: Number(inv.paidAmount || 0),
          dueAmount: Number(inv.dueAmount || 0),
          status: Number(inv.dueAmount || 0) <= 0 
            ? 'PAID' 
            : Number(inv.paidAmount || 0) > 0 
              ? 'PARTIAL' 
              : new Date(inv.dueDate) < new Date() 
                ? 'OVERDUE' 
                : 'UNPAID',
        };
      }
    } catch {
      const list = await this.list();
      return list.find((item) => item.id === id) || null;
    }
    return null;
  },

  async create(input: CreateInvoiceInput): Promise<InvoiceContract> {
    try {
      const inv = await apiClient.get<any>(`/invoices/order/${input.orderId}`);
      if (inv) {
        return {
          id: inv.id,
          invoiceNo: inv.invoiceNumber,
          orderId: inv.orderId,
          customerName: inv.customer?.name || 'Walk-in Customer',
          date: inv.createdAt,
          dueDate: inv.dueDate,
          totalAmount: Number(inv.totalAmount || 0),
          paidAmount: Number(inv.paidAmount || 0),
          dueAmount: Number(inv.dueAmount || 0),
          status: 'UNPAID',
        };
      }
    } catch {}

    return {
      id: `inv_fallback_${Date.now()}`,
      invoiceNo: `INV-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: input.orderId,
      customerName: 'Customer Profile',
      date: new Date().toISOString().split('T')[0],
      dueDate: input.dueDate,
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      status: 'UNPAID',
    };
  },

  async update(id: string, input: any): Promise<InvoiceContract> {
    const res = await apiClient.patch<any>(`/invoices/${id}`, input);
    return {
      id: res.id,
      invoiceNo: res.invoiceNumber,
      orderId: res.orderId,
      customerName: res.customer?.name || 'Customer',
      date: res.createdAt,
      dueDate: res.dueDate,
      totalAmount: Number(res.totalAmount || 0),
      paidAmount: Number(res.paidAmount || 0),
      dueAmount: Number(res.dueAmount || 0),
      status: Number(res.dueAmount || 0) <= 0 ? 'PAID' : 'UNPAID',
    };
  },

  async delete(id: string): Promise<boolean> {
    return true;
  },
};
export default invoicesMock;
