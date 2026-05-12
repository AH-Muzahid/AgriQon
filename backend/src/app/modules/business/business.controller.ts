import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { BusinessService } from './business.service';
import { BusinessRepository } from './business.repository';
import { AuthRequest } from '../../middleware/auth.middleware';

const businessRepository = new BusinessRepository();
const businessService = new BusinessService(businessRepository);

const createBusiness = catchAsync(async (req: Request, res: Response) => {
  const result = await businessService.createBusiness(req.body);

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

export const BusinessController = {
  createBusiness,
  getMyBusiness,
};
