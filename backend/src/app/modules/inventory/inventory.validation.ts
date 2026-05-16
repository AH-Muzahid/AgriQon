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
    unitCost: z.number().optional(),
  }),
});

const initiateTransferSchema = z.object({
  body: z.object({
    sourceWarehouseId: z.string({
      required_error: 'Source warehouse ID is required',
    }),
    destinationWarehouseId: z.string({
      required_error: 'Destination warehouse ID is required',
    }),
    items: z.array(
      z.object({
        itemId: z.string({
          required_error: 'Item ID is required',
        }),
        quantity: z.number({
          required_error: 'Quantity is required',
        }).positive('Quantity must be positive'),
      })
    ).min(1, 'At least one item is required'),
  }),
});

export const InventoryValidation = {
  adjustStockSchema,
  initiateTransferSchema,
};
