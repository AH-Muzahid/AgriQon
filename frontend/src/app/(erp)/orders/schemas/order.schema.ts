import * as z from 'zod';

export const orderItemSchema = z.object({
  itemId: z.string().min(1, 'Product SKU is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0.01, 'Unit price must be greater than 0'),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  warehouseId: z.string().min(1, 'Warehouse selection is required'),
  items: z.array(orderItemSchema).min(1, 'At least one line item is required'),
  notes: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof orderSchema>;

export const paymentCollectionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  method: z.enum(['CASH', 'BKASH', 'NAGAD', 'BANK_TRANSFER', 'CARD'] as const),
  transactionId: z.string().optional(),
  gateway: z.enum(['BKASH', 'NAGAD', 'SSLCOMMERZ', 'STRIPE', 'OFFLINE'] as const).default('OFFLINE'),
});

export type PaymentCollectionFormValues = z.infer<typeof paymentCollectionSchema>;
