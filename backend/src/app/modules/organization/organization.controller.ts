import { Response } from 'express';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';
import { OrganizationService } from './organization.service';
import httpStatus from 'http-status';
import { AppError } from '../../errors/AppError';

export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  getBusinessUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId || req.user?.businessId;
    if (!businessId) {
      throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
    }

    const result = await this.organizationService.getBusinessUsers(businessId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Organization users retrieved successfully',
      data: result,
    });
  });

  inviteUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId || req.user?.businessId;
    if (!businessId) {
      throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
    }

    const { email, name, role } = req.body;

    const result = await this.organizationService.inviteUser({
      email,
      name,
      role,
      businessId,
      actorId: req.user?.id,
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'User invited successfully',
      data: result,
    });
  });

  revokeUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId || req.user?.businessId;
    if (!businessId) {
      throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
    }

    const { userId } = req.params;

    const result = await this.organizationService.revokeUser(userId, businessId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User access revoked successfully',
      data: result,
    });
  });

  updateRole = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId || req.user?.businessId;
    if (!businessId) {
      throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
    }

    const { userId } = req.params;
    const { role } = req.body;

    const result = await this.organizationService.updateRole(userId, businessId, role);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User role updated successfully',
      data: result,
    });
  });
}
