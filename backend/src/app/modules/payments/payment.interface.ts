import { TCurrency, TPaymentGateway, TPaymentStatus } from './payment.types';

export interface IPayment {
  invoiceId: string;
  businessId: string;
  amount: number;
  currency: TCurrency;
  gateway: TPaymentGateway;
  status: TPaymentStatus;
  transactionId?: string;
  metadata?: Record<string, any>;
}

export interface IRefund {
  paymentId: string;
  amount: number;
  reason: string;
}
