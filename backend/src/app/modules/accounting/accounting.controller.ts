import { Response } from 'express';
import { AccountingService } from './accounting.service';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { sendResponse } from '../../shared/utils/sendResponse';
import catchAsync from '../../shared/utils/catchAsync';

export class AccountingController {
  constructor(private accountingService: AccountingService) {}

  createAccount = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await this.accountingService.createAccount(businessId, req.body, req.user?.id);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  });

  getAccounts = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await this.accountingService.getAccounts(businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Accounts fetched successfully',
      data: result,
    });
  });

  createJournalEntry = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const userId = req.user?.id as string;
    const result = await this.accountingService.createJournalEntry(businessId, userId, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Journal entry created successfully',
      data: result,
    });
  });

  getLedger = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await this.accountingService.getLedger(businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Ledger entries fetched successfully',
      data: result,
    });
  });

  reconcileBalances = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await this.accountingService.reconcileBalances(businessId, req.user?.id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Reconciliation report generated successfully',
      data: result,
    });
  });
}
