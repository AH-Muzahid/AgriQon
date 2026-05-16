import { z } from 'zod';

const createWarehouseSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Warehouse name is required',
    }),
    location: z.string().optional(),
  }),
});

const updateWarehouseSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    location: z.string().optional(),
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
        }).positive(),
      })
    ).min(1, 'At least one item is required'),
    notes: z.string().optional(),
  }),
});

const updateTransferStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'], {
      required_error: 'Status is required',
    }),
  }),
});

export const WarehouseValidation = {
  createWarehouseSchema,
  updateWarehouseSchema,
  initiateTransferSchema,
  updateTransferStatusSchema,
};
