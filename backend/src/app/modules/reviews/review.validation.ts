import { z } from 'zod';

const createReviewZodSchema = z.object({
  body: z.object({
    itemId: z.string({
      required_error: 'Item ID is required',
    }),
    rating: z.number({
      required_error: 'Rating is required',
    }).min(1).max(5),
    comment: z.string().optional(),
  }),
});

const updateReviewZodSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewZodSchema,
  updateReviewZodSchema,
};
