import { z } from 'zod';

const createBusinessSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Business name is required',
    }),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url().optional(),
    logo: z.string().optional(),
  }),
});

const updateBusinessSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    website: z.string().url().optional(),
    logo: z.string().optional(),
    taxNumber: z.string().optional(),
    currency: z.string().optional(),
  }),
});

export type CreateBusinessDTO = z.infer<typeof createBusinessSchema>['body'];
export type UpdateBusinessDTO = z.infer<typeof updateBusinessSchema>['body'];

export const BusinessValidation = {
  createBusinessSchema,
  updateBusinessSchema,
};
