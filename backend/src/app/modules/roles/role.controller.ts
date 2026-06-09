import { Response } from 'express';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';
import { RoleService } from './role.service';
import httpStatus from 'http-status';
import { AppError } from '../../errors/AppError';

const roleService = new RoleService();

const getAllRoles = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await roleService.getAllRoles(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Roles retrieved successfully',
    data: result,
  });
});

const createRole = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await roleService.createCustomRole(businessId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Custom role created successfully',
    data: result,
  });
});

const updateRole = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { id } = req.params;
  const result = await roleService.updateCustomRole(id, businessId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Custom role updated successfully',
    data: result,
  });
});

const deleteRole = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { id } = req.params;
  await roleService.deleteCustomRole(id, businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Custom role deleted successfully',
    data: null,
  });
});

export const RoleController = {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
};
