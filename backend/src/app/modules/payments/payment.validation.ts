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

const queryPaymentSchema = z.object({
  query: z.object({
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(10),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.enum(['PENDING', 'PARTIAL', 'COMPLETED', 'FAILED', 'REFUNDED'] as const).optional(),
    invoiceId: z.string().optional(),
    customerId: z.string().optional(),
  }),
});

export const PaymentValidation = {
  initiatePaymentSchema,
  refundPaymentSchema,
  queryPaymentSchema,
};
