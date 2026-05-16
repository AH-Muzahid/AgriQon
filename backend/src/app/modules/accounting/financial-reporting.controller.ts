import { Response } from 'express';
import { FinancialReportingService } from './financial-reporting.service';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { sendResponse } from '../../shared/utils/sendResponse';
import catchAsync from '../../shared/utils/catchAsync';

const financialReportingService = new FinancialReportingService();

export const FinancialReportingController = {
  getTrialBalance: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { startDate, endDate } = req.query;
    
    const result = await financialReportingService.getTrialBalance(
      businessId,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Trial Balance generated successfully',
      data: result,
    });
  }),

  getProfitAndLoss: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const result = await financialReportingService.getProfitAndLoss(
      businessId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Profit and Loss report generated successfully',
      data: result,
    });
  }),

  getBalanceSheet: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { date } = req.query;

    const result = await financialReportingService.getBalanceSheet(
      businessId,
      date ? new Date(date as string) : undefined
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Balance Sheet generated successfully',
      data: result,
    });
  }),
};
