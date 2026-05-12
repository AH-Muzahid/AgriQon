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

export const WarehouseValidation = {
  createWarehouseSchema,
  updateWarehouseSchema,
};
