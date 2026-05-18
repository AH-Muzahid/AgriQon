import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { BusinessService } from './business.service';
import { BusinessRepository } from './business.repository';
import { AuthRequest } from '../../middleware/auth.middleware';

const businessRepository = new BusinessRepository();
const businessService = new BusinessService(businessRepository);

const createBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  const result = await businessService.createBusiness({
    ...req.body,
    organizationId,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Business created successfully',
    data: result,
  });
});

const getMyBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;

  if (!businessId) {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'No business associated with this user',
      data: null,
    });
    return;
  }

  const result = await businessService.getBusinessById(businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Business retrieved successfully',
    data: result,
  });
});

const updateBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await businessService.updateBusiness(id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Business updated successfully',
    data: result,
  });
});

const deleteBusiness = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await businessService.deleteBusiness(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Business deleted successfully',
    data: null,
  });
});

const getBusinessesByOrganization = catchAsync(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId as string;
  const result = await businessService.getBusinessesByOrganization(organizationId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Businesses retrieved successfully',
    data: result,
  });
});

const getAllBusinesses = catchAsync(async (req: Request, res: Response) => {
  const result = await businessService.getAllBusinesses();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Businesses retrieved successfully',
    data: result,
  });
});

export const BusinessController = {
  createBusiness,
  getMyBusiness,
  updateBusiness,
  deleteBusiness,
  getBusinessesByOrganization,
  getAllBusinesses,
};
