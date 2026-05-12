import type { Request, Response } from 'express';
import { createReviewSchema } from './review.schemas';
import { reviewService } from './review.service';

export const reviewController = {
  async create(req: Request, res: Response) {
    const payload = createReviewSchema.parse(req.body);
    return res.status(201).json(await reviewService.create(req.user!.id, req.user?.businessId || undefined, payload));
  },

  async listForItem(req: Request, res: Response) {
    return res.json(await reviewService.listForItem(req.params.itemId, req.user?.id, req.user?.businessId || undefined));
  },
};
