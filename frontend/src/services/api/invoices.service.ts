import { InvoiceContract, CreateInvoiceInput } from '@/types/contracts/invoice.contract';
import { apiClient } from './client';

export const invoicesService = {
  async list(): Promise<InvoiceContract[]> {
    const res = await apiClient.client.get('/invoices?limit=100');
    const body = res.data || {};
    const items = body.data || [];

    return items.map((inv: any) => {
      const due = Number(inv.dueAmount || 0);
      const paid = Number(inv.paidAmount || 0);
      const isOverdue = inv.dueDate ? new Date(inv.dueDate) < new Date() : false;

      let statusMapped: InvoiceContract['status'] = 'UNPAID';
      if (due <= 0) {
        statusMapped = 'PAID';
      } else if (paid > 0) {
        statusMapped = 'PARTIAL';
      } else if (isOverdue) {
        statusMapped = 'OVERDUE';
      }

      return {
        id: inv.id,
        invoiceNo: inv.invoiceNumber,
        orderId: inv.orderId,
        customerName: inv.customer?.name || 'Walk-in Customer',
        date: inv.createdAt,
        dueDate: inv.dueDate || '',
        totalAmount: Number(inv.totalAmount || 0),
        paidAmount: paid,
        dueAmount: due,
        status: statusMapped,
      };
    });
  },

  async getById(id: string): Promise<InvoiceContract | null> {
    try {
      const res = await apiClient.client.get(`/invoices/${id}`);
      const body = res.data || {};
      const inv = body.data || body;
      if (!inv) return null;

      const due = Number(inv.dueAmount || 0);
      const paid = Number(inv.paidAmount || 0);
      const isOverdue = inv.dueDate ? new Date(inv.dueDate) < new Date() : false;

      let statusMapped: InvoiceContract['status'] = 'UNPAID';
      if (due <= 0) {
        statusMapped = 'PAID';
      } else if (paid > 0) {
        statusMapped = 'PARTIAL';
      } else if (isOverdue) {
        statusMapped = 'OVERDUE';
      }

      return {
        id: inv.id,
        invoiceNo: inv.invoiceNumber,
        orderId: inv.orderId,
        customerName: inv.customer?.name || 'Walk-in Customer',
        date: inv.createdAt,
        dueDate: inv.dueDate || '',
        totalAmount: Number(inv.totalAmount || 0),
        paidAmount: paid,
        dueAmount: due,
        status: statusMapped,
      };
    } catch {
      const list = await this.list();
      return list.find((item) => item.id === id) || null;
    }
  },

  async getByOrderId(orderId: string): Promise<InvoiceContract | null> {
    try {
      const res = await apiClient.client.get(`/invoices/order/${orderId}`);
      const body = res.data || {};
      const inv = body.data || body;
      if (!inv) return null;

      const due = Number(inv.dueAmount || 0);
      const paid = Number(inv.paidAmount || 0);
      const isOverdue = inv.dueDate ? new Date(inv.dueDate) < new Date() : false;

      let statusMapped: InvoiceContract['status'] = 'UNPAID';
      if (due <= 0) {
        statusMapped = 'PAID';
      } else if (paid > 0) {
        statusMapped = 'PARTIAL';
      } else if (isOverdue) {
        statusMapped = 'OVERDUE';
      }

      return {
        id: inv.id,
        invoiceNo: inv.invoiceNumber,
        orderId: inv.orderId,
        customerName: inv.customer?.name || 'Walk-in Customer',
        date: inv.createdAt,
        dueDate: inv.dueDate || '',
        totalAmount: Number(inv.totalAmount || 0),
        paidAmount: paid,
        dueAmount: due,
        status: statusMapped,
      };
    } catch {
      return null;
    }
  },

  async create(input: CreateInvoiceInput): Promise<InvoiceContract> {
    const existing = await this.getByOrderId(input.orderId);
    if (existing) return existing;

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
    const due = Number(res.dueAmount || 0);
    return {
      id: res.id,
      invoiceNo: res.invoiceNumber,
      orderId: res.orderId,
      customerName: res.customer?.name || 'Customer',
      date: res.createdAt,
      dueDate: res.dueDate || '',
      totalAmount: Number(res.totalAmount || 0),
      paidAmount: Number(res.paidAmount || 0),
      dueAmount: due,
      status: due <= 0 ? 'PAID' : 'UNPAID',
    };
  },
};
export default invoicesService;
