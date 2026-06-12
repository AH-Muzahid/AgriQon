import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';
import httpStatus from 'http-status';
import { PlatformService } from './platform.service';
import { AuthRequest } from '../../middleware/rbac.middleware';

const platformService = new PlatformService();

const getPlans = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await platformService.listPlans();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription plans retrieved successfully',
    data: result,
  });
});

const getPlanById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await platformService.getPlan(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription plan retrieved successfully',
    data: result,
  });
});

const createPlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await platformService.createPlan(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Subscription plan created successfully',
    data: result,
  });
});

const updatePlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await platformService.updatePlan(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription plan updated successfully',
    data: result,
  });
});

const deletePlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await platformService.deletePlan(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription plan deleted successfully',
    data: result,
  });
});

const getHealthStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await platformService.getSystemHealth();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'System health report generated successfully',
    data: result,
  });
});

const getQueuesStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await platformService.getQueueMetrics();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Background job queues metrics retrieved successfully',
    data: result,
  });
});

const postImpersonateUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    throw new Error('Target email is required for impersonation');
  }
  const result = await platformService.impersonateUser(
    { id: req.user!.id, email: req.user!.email || '' },
    email
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Impersonation token generated successfully',
    data: result,
  });
});

const getGlobalAuditLogsList = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await platformService.getGlobalAuditLogs(page, limit);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Global audit logs retrieved successfully',
    data: result,
  });
});

export const PlatformController = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getHealthStatus,
  getQueuesStatus,
  postImpersonateUser,
  getGlobalAuditLogsList,
};
