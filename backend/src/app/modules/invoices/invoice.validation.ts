import { z } from 'zod';

export const invoiceQuerySchema = z.object({
  query: z.object({
    customerId: z.string().optional(),
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(10),
  }),
});

export const updateInvoiceSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    dueDate: z.coerce.date().optional(),
    paidAmount: z.number().min(0).optional(),
  }),
});
