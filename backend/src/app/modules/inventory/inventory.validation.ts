import { MovementType } from '../../../generated/client';
import { z } from 'zod';

const adjustStockSchema = z.object({
  body: z.object({
    itemId: z.string({
      required_error: 'Item ID is required',
    }),
    warehouseId: z.string({
      required_error: 'Warehouse ID is required',
    }),
    quantity: z.number({
      required_error: 'Quantity is required',
    }),
    type: z.nativeEnum(MovementType, {
      required_error: 'Movement type is required',
    }),
    reason: z.string().optional(),
    reference: z.string().optional(),
  }),
});

export const InventoryValidation = {
  adjustStockSchema,
};
