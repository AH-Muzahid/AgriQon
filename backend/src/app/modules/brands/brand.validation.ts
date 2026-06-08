import { z } from "zod";

// Schemas must wrap fields in `body:` to match the shape that
// validateRequest parses: { body, query, params, cookies }.
const createBrandSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(1, "Name cannot be empty"),
  }),
});

const updateBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
  }),
});

export const BrandValidation = {
  createBrandSchema,
  updateBrandSchema,
};
