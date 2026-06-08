import { z } from "zod";

// Schemas must wrap fields in `body:` to match the shape that
// validateRequest parses: { body, query, params, cookies }.
const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(1, "Name cannot be empty"),
    parentId: z.string().uuid("Parent ID must be a valid UUID").optional(),
  }),
});

const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    parentId: z.string().uuid("Parent ID must be a valid UUID").optional(),
  }),
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema,
};
