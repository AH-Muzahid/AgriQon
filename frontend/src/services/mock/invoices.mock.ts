import { InvoiceContract, CreateInvoiceInput } from '@/types/contracts/invoice.contract';
import { MOCK_INVOICES } from '@/lib/mock-erp-data';

export const invoicesMock = {
  async list(): Promise<InvoiceContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_INVOICES as any[] as InvoiceContract[]), 100));
  },

  async getById(id: string): Promise<InvoiceContract | null> {
    return new Promise((resolve) => {
      const inv = MOCK_INVOICES.find((item) => item.id === id);
      setTimeout(() => resolve((inv as any as InvoiceContract) || null), 100);
    });
  },

  async create(input: CreateInvoiceInput): Promise<InvoiceContract> {
    return new Promise((resolve) => {
      const created: InvoiceContract = {
        id: `inv_${Math.floor(Math.random() * 10000)}`,
        invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: input.orderId,
        customerName: 'Mock Customer Profile',
        date: new Date().toISOString().split('T')[0],
        dueDate: input.dueDate,
        totalAmount: 15000,
        paidAmount: 0,
        dueAmount: 15000,
        status: 'UNPAID',
      };
      setTimeout(() => resolve(created), 100);
    });
  },

  async update(id: string, input: any): Promise<InvoiceContract> {
    return new Promise((resolve, reject) => {
      const inv = MOCK_INVOICES.find((item) => item.id === id);
      if (!inv) return reject(new Error('Invoice not found'));
      const updated: InvoiceContract = {
        ...(inv as any as InvoiceContract),
        ...input,
      };
      setTimeout(() => resolve(updated), 100);
    });
  },

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 100));
  },
};
export default invoicesMock;
