import { Response } from 'express';
import { LoyaltyService } from './loyalty.service';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { sendResponse } from '../../shared/utils/sendResponse';
import catchAsync from '../../shared/utils/catchAsync';

const loyaltyService = new LoyaltyService();

export const LoyaltyController = {
  setupProgram: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await loyaltyService.createOrUpdateProgram(businessId, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Loyalty program setup successfully',
      data: result,
    });
  }),

  getBalance: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { customerId } = req.params;
    const result = await loyaltyService.getCustomerBalance(customerId, businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Customer loyalty balance fetched',
      data: { balance: result },
    });
  }),
};
