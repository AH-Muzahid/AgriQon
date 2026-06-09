import { Response } from 'express';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';
import { SubscriptionService } from './subscription.service';
import httpStatus from 'http-status';
import { AppError } from '../../errors/AppError';

const subscriptionService = new SubscriptionService();

const getSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await subscriptionService.getSubscription(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription details retrieved successfully',
    data: result,
  });
});

const getSubscriptionUsage = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await subscriptionService.getSubscriptionUsage(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription usage details retrieved successfully',
    data: result,
  });
});

export const SubscriptionController = {
  getSubscription,
  getSubscriptionUsage,
};
