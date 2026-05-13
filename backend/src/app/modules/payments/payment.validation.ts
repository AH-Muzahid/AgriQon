import { z } from 'zod';
import { PAYMENT_GATEWAYS, CURRENCIES } from './payment.constants';

const initiatePaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string({
      required_error: 'Invoice ID is required',
    }),
    businessId: z.string({
      required_error: 'Business ID is required',
    }),
    amount: z.number({
      required_error: 'Amount is required',
    }).positive('Amount must be positive'),
    currency: z.enum([...Object.values(CURRENCIES)] as [string, ...string[]]).default(CURRENCIES.USD),
    gateway: z.enum([...Object.values(PAYMENT_GATEWAYS)] as [string, ...string[]], {
      required_error: 'Payment gateway is required',
    }),
    metadata: z.record(z.any()).optional(),
  }),
});

const refundPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string({
      required_error: 'Payment ID is required',
    }),
    amount: z.number({
      required_error: 'Amount is required',
    }).positive('Amount must be positive'),
    reason: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const PaymentValidation = {
  initiatePaymentSchema,
  refundPaymentSchema,
};
