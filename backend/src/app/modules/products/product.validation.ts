import { z } from 'zod';

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12), // Rule 12: Standardize limit
});

export const createProductSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  categoryId: z.string().uuid(),
  price: z.coerce.number().positive(),
  unit: z.string().min(1).max(20).default('kg'),
  initialStock: z.coerce.number().int().nonnegative().default(0), // renamed for clarity
  imageUrl: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
