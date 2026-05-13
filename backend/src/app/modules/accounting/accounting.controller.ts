import { Response } from 'express';
import { AccountingService } from './accounting.service';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { sendResponse } from '../../shared/utils/sendResponse';
import catchAsync from '../../shared/utils/catchAsync';

const accountingService = new AccountingService();

export const AccountingController = {
  createAccount: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await accountingService.createAccount(businessId, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  }),

  getAccounts: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await accountingService.getAccounts(businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Accounts fetched successfully',
      data: result,
    });
  }),

  recordTransaction: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const userId = req.user?.id as string;
    const result = await accountingService.recordTransaction(businessId, userId, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Transaction recorded successfully',
      data: result,
    });
  }),

  getLedger: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await accountingService.getLedger(businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Ledger entries fetched successfully',
      data: result,
    });
  }),
};
