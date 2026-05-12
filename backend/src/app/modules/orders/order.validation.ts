import { z } from 'zod';

const orderItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  warehouseId: z.string().min(1, 'Warehouse ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be positive'),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
});

export const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().optional(),
    items: z.array(orderItemSchema).min(1, 'At least one item is required'),
    discount: z.number().min(0).default(0),
    taxAmount: z.number().min(0).default(0),
    // Rule 13: Idempotency key required for order creation
    idempotencyKey: z.string().uuid('idempotencyKey must be a valid UUID'),
    // For invoice creation
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']),
  }),
});

export const orderQuerySchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED']).optional(),
    customerId: z.string().optional(),
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().positive().max(100).default(10),
  }),
});
