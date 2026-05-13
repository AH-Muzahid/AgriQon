import { z } from 'zod';

const createBrandSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
  }),
});

const updateBrandSchema = z.object({
  name: z.string().optional(),
});

export const BrandValidation = {
  createBrandSchema,
  updateBrandSchema,
};
