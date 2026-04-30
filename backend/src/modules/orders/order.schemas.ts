import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      itemId: z.string().min(1),
      quantity: z.coerce.number().int().positive(),
    }),
  ).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});
