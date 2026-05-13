import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string({
    required_error: 'Name is required',
  }),
  parentId: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().optional(),
  parentId: z.string().optional(),
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema,
};
