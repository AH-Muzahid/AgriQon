import { PaymentContract, CreatePaymentInput } from '@/types/contracts/payment.contract';
import { apiClient } from '../api/client';
import { invoicesMock } from './invoices.mock';

export const paymentsMock = {
  async list(): Promise<PaymentContract[]> {
    try {
      const invoices = await invoicesMock.list();
      const payments: PaymentContract[] = [];
      
      invoices.forEach((inv) => {
        if (inv.paidAmount > 0) {
          payments.push({
            id: `pay_${inv.id}`,
            paymentNo: `PMT-${inv.invoiceNo.replace('INV-', '')}`,
            invoiceNo: inv.invoiceNo,
            date: inv.date,
            customerName: inv.customerName,
            amount: inv.paidAmount,
            method: 'MFS (bKash/Nagad)',
            status: 'SUCCESS',
          });
        }
      });
      return payments;
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<PaymentContract | null> {
    const list = await this.list();
    return list.find((item) => item.id === id) || null;
  },

  async create(input: CreatePaymentInput): Promise<PaymentContract> {
    // 1. Resolve invoice
    const invoices = await apiClient.get<any[]>('/invoices?limit=100');
    const invoice = invoices.find((inv: any) => inv.invoiceNumber === input.invoiceNo || inv.id === input.invoiceNo);
    if (!invoice) throw new Error('Invoice not found');

    // 2. Call initiate
    const res = await apiClient.post<any>('/payments/initiate', {
      invoiceId: invoice.orderId,
      amount: input.amount,
      currency: 'BDT',
      gateway: 'BKASH',
    });

    const transactionId = res.transactionId;

    // 3. Immediately trigger mock webhook success for automatic clearance
    if (transactionId) {
      try {
        await apiClient.post<any>('/payments/webhook/bkash', {
          transactionId,
          amount: input.amount,
        });
      } catch (err) {
        console.error('Failed to auto-clear payment:', err);
      }
    }

    return {
      id: res.paymentId || `pay_${Date.now()}`,
      paymentNo: `PMT-${invoice.invoiceNumber.replace('INV-', '')}`,
      invoiceNo: input.invoiceNo,
      date: new Date().toISOString(),
      customerName: invoice.customer?.name || 'Customer Profile',
      amount: input.amount,
      method: input.method,
      status: 'SUCCESS',
    };
  },

  async update(id: string, input: any): Promise<PaymentContract> {
    return this.getById(id) as any;
  },

  async delete(id: string): Promise<boolean> {
    return true;
  },
};
export default paymentsMock;
