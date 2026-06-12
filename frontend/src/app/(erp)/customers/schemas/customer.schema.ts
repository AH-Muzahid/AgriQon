import * as z from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer Name is required'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
