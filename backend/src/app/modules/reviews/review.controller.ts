import { Response } from 'express';
import { ReviewService } from './review.service';
import { sendResponse } from '../../shared/utils/sendResponse';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { PermissionService } from '../../services/permission.service';
import { REVIEW_MANAGE } from '../../constants/permissions';

const reviewService = new ReviewService();

const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const userId = req.user!.id;
  const result = await reviewService.createReview(businessId, userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviewsByItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  // businessId may be absent for unauthenticated/consumer browsing — handled in service
  const businessId = req.user?.businessId ?? req.businessId ?? '';
  const { itemId } = req.params;
  const result = await reviewService.getReviewsByItem(itemId, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const getAllReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId ?? req.user!.businessId!;
  const result = await reviewService.getAllReviews(businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All reviews retrieved successfully',
    data: result,
  });
});

const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const userId = req.user!.id;
  const { id } = req.params;
  const result = await reviewService.updateReview(id, businessId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const userId = req.user!.id;
  const { id } = req.params;

  // Derive moderator flag from RBAC permissions — no raw role string check
  let isModerator = false;
  if (userId && businessId) {
    const getPermissionsForUser = (PermissionService as any).getPermissionsForUser;
    const granted = getPermissionsForUser
      ? await getPermissionsForUser(userId, businessId)
      : (req.businessRole ? await PermissionService.getPermissionsForRole(req.businessRole) : []);
    isModerator = granted.includes(REVIEW_MANAGE);
  }

  await reviewService.deleteReview(id, businessId, userId, isModerator);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getReviewsByItem,
  getAllReviews,
  updateReview,
  deleteReview,
};
