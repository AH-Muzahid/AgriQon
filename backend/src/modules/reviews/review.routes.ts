import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate } from '../../middleware/auth';
import { reviewController } from './review.controller';

export const reviewRouter = Router();

reviewRouter.get('/item/:itemId', asyncHandler(reviewController.listForItem));
reviewRouter.post('/', authenticate, asyncHandler(reviewController.create));
