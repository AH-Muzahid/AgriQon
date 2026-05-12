import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email('Invalid email').optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Customer ID is required'),
  }),
});

export const customerQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(10),
  }),
});
