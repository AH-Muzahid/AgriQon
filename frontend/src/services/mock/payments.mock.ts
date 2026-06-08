import { PaymentContract, CreatePaymentInput } from '@/types/contracts/payment.contract';
import { MOCK_PAYMENTS } from '@/lib/mock-erp-data';

export const paymentsMock = {
  async list(): Promise<PaymentContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PAYMENTS as any[] as PaymentContract[]), 100));
  },

  async getById(id: string): Promise<PaymentContract | null> {
    return new Promise((resolve) => {
      const p = MOCK_PAYMENTS.find((item) => item.id === id);
      setTimeout(() => resolve((p as any as PaymentContract) || null), 100);
    });
  },

  async create(input: CreatePaymentInput): Promise<PaymentContract> {
    return new Promise((resolve) => {
      const created: PaymentContract = {
        id: `pay_${Math.floor(Math.random() * 10000)}`,
        paymentNo: `PMT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceNo: input.invoiceNo,
        date: new Date().toISOString(),
        customerName: 'Mock Customer Profile',
        amount: input.amount,
        method: input.method,
        status: 'SUCCESS',
      };
      setTimeout(() => resolve(created), 100);
    });
  },

  async update(id: string, input: any): Promise<PaymentContract> {
    return new Promise((resolve, reject) => {
      const p = MOCK_PAYMENTS.find((item) => item.id === id);
      if (!p) return reject(new Error('Payment not found'));
      const updated: PaymentContract = {
        ...(p as any as PaymentContract),
        ...input,
      };
      setTimeout(() => resolve(updated), 100);
    });
  },

  async delete(id: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 100));
  },
};
export default paymentsMock;
