import { Response } from 'express';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';
import { PermissionService as PermissionMetadataService } from './permission.service';
import httpStatus from 'http-status';
import { AppError } from '../../errors/AppError';

const permissionMetadataService = new PermissionMetadataService();

const getPermissionsMetadata = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await permissionMetadataService.getPermissionsMetadata(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Permissions metadata retrieved successfully',
    data: result,
  });
});

export const PermissionController = {
  getPermissionsMetadata,
};
