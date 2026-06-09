import { Response } from 'express';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';
import { OrganizationService } from './organization.service';
import httpStatus from 'http-status';
import { AppError } from '../../errors/AppError';

const organizationService = new OrganizationService();

const getBusinessUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await organizationService.getBusinessUsers(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization users retrieved successfully',
    data: result,
  });
});

const inviteUser = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { email, name, role } = req.body;

  const result = await organizationService.inviteUser({
    email,
    name,
    role,
    businessId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User invited successfully',
    data: result,
  });
});

export const OrganizationController = {
  getBusinessUsers,
  inviteUser,
};
