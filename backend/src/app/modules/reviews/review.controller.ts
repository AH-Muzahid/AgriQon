import { Request, Response } from 'express';
import { ReviewService } from './review.service';
import { sendResponse } from '../../shared/utils/sendResponse';
import { asyncHandler } from '../../../middleware/asyncHandler';

const reviewService = new ReviewService();

const createReview = asyncHandler(async (req: Request, res: Response) => {
  const businessId = (req as any).user.businessId;
  const userId = (req as any).user.id;
  const result = await reviewService.createReview(businessId, userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviewsByItem = asyncHandler(async (req: Request, res: Response) => {
  const businessId = (req as any).user.businessId;
  const { itemId } = req.params;
  const result = await reviewService.getReviewsByItem(itemId, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

const getAllReviews = asyncHandler(async (req: Request, res: Response) => {
  const businessId = (req as any).user.businessId;
  const result = await reviewService.getAllReviews(businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All reviews retrieved successfully',
    data: result,
  });
});

const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const businessId = (req as any).user.businessId;
  const userId = (req as any).user.id;
  const { id } = req.params;
  const result = await reviewService.updateReview(id, businessId, userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const businessId = (req as any).user.businessId;
  const userId = (req as any).user.id;
  const role = (req as any).user.role;
  const { id } = req.params;
  await reviewService.deleteReview(id, businessId, userId, role);

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
