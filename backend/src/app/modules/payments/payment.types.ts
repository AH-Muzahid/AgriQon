import { PAYMENT_GATEWAYS, PAYMENT_STATUS, CURRENCIES } from './payment.constants';

export type TPaymentStatus = keyof typeof PAYMENT_STATUS;
export type TPaymentGateway = keyof typeof PAYMENT_GATEWAYS;
export type TCurrency = keyof typeof CURRENCIES;

export type TInitiatePaymentParams = {
  invoiceId: string;
  businessId: string;
  amount: number;
  currency: TCurrency;
  gateway: TPaymentGateway;
  metadata?: Record<string, any>;
};

export type TPaymentGatewayResponse = {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  clientSecret?: string; // For Stripe
  message?: string;
  rawResponse?: any;
};

export type TRefundParams = {
  paymentId: string;
  amount: number;
  reason?: string;
  metadata?: Record<string, any>;
};

export type TRefundResponse = {
  success: boolean;
  refundId?: string;
  message?: string;
  rawResponse?: any;
};
