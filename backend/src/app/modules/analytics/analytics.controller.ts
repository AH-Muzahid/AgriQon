import { Response } from 'express';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';
import { AnalyticsService } from './analytics.service';
import httpStatus from 'http-status';
import { AppError } from '../../errors/AppError';

const analyticsService = new AnalyticsService();

const getDashboardSummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await analyticsService.getDashboardSummary(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard summary retrieved successfully',
    data: result,
  });
});

const getFinancialTrend = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { startDate, endDate } = req.query;

  const result = await analyticsService.getFinancialTrend(
    businessId,
    startDate as string | undefined,
    endDate as string | undefined
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Financial trend retrieved successfully',
    data: result,
  });
});

const getSalesDashboard = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await analyticsService.getSalesDashboard(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Sales dashboard retrieved successfully',
    data: result,
  });
});

export const AnalyticsController = {
  getDashboardSummary,
  getFinancialTrend,
  getSalesDashboard,
};
