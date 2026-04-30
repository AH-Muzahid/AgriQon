import { z } from 'zod';

export const itemQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

export const createItemSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  category: z.string().min(2).max(60),
  price: z.coerce.number().positive(),
  unit: z.string().min(1).max(20).default('kg'),
  stock: z.coerce.number().int().nonnegative().default(0),
  imageUrl: z.string().url().optional(),
});

export const updateItemSchema = createItemSchema.partial();
