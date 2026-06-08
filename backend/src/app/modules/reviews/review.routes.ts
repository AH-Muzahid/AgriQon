import { Router } from "express";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";
import validateRequest from "../../middleware/validateRequest";
import {
  extractAuth,
  requireAuth,
  attachBusinessRole,
  authorizeAny,
} from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { REVIEW_VIEW } from "../../constants/permissions";

const router = Router();

// ─── Consumer: Create a review (any authenticated user) ──────────────
router.post(
  "/",
  extractAuth,
  requireAuth,
  validateRequest(ReviewValidation.createReviewZodSchema),
  ReviewController.createReview,
);

// ─── Business: View all reviews for the tenant ───────────────────────
router.get(
  "/",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REVIEW_VIEW),
  ReviewController.getAllReviews,
);

// ─── Public: Browse reviews for a product item ───────────────────────
router.get("/item/:itemId", extractAuth, ReviewController.getReviewsByItem);

// ─── Consumer: Edit own review ───────────────────────────────────────
router.patch(
  "/:id",
  extractAuth,
  requireAuth,
  validateRequest(ReviewValidation.updateReviewZodSchema),
  ReviewController.updateReview,
);

// ─── Consumer + Moderator: Delete (author self-delete or REVIEW_MANAGE) ─
router.delete(
  "/:id",
  extractAuth,
  requireAuth,
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
