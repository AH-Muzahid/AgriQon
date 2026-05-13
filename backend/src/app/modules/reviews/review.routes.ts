import { Router } from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import { validateRequest } from '../../../middleware/validateRequest';
import { auth } from '../../../middleware/auth';
import { Role } from '../../../generated/client';

const router = Router();

router.post(
  '/',
  auth(Role.USER, Role.SELLER, Role.ADMIN),
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview
);

router.get(
  '/',
  auth(Role.ADMIN, Role.MANAGER),
  ReviewController.getAllReviews
);

router.get(
  '/item/:itemId',
  auth(Role.USER, Role.SELLER, Role.ADMIN, Role.MANAGER),
  ReviewController.getReviewsByItem
);

router.patch(
  '/:id',
  auth(Role.USER),
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview
);

router.delete(
  '/:id',
  auth(Role.USER, Role.ADMIN),
  ReviewController.deleteReview
);

export const ReviewRoutes = router;
