import { z } from 'zod';
import { PurchaseStatus } from '../../../generated/client';

export const purchaseItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.coerce.number().positive(),
  unitCost: z.coerce.number().positive(),
});

export const createPurchaseSchema = z.object({
  supplierId: z.string().uuid(),
  total: z.coerce.number().positive().optional(),
  items: z.array(purchaseItemSchema).min(1),
  notes: z.string().optional(),
});

export const updatePurchaseStatusSchema = z.object({
  status: z.nativeEnum(PurchaseStatus),
});

export const receivePurchaseSchema = z.object({
  warehouseId: z.string().uuid(),
});

export const purchaseQuerySchema = z.object({
  status: z.nativeEnum(PurchaseStatus).optional(),
  supplierId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type UpdatePurchaseStatusInput = z.infer<typeof updatePurchaseStatusSchema>;
export type ReceivePurchaseInput = z.infer<typeof receivePurchaseSchema>;
export type PurchaseQueryInput = z.infer<typeof purchaseQuerySchema>;
