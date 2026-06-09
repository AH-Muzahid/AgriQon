import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ReportService } from './report.service';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';

const reportService = new ReportService();

export const getInventoryValuationReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const result = await reportService.getInventoryValuationReport(businessId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inventory valuation report generated successfully',
    data: result
  });
});

export const getProcurementReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { startDate, endDate } = req.query;
  
  const result = await reportService.getProcurementReport(
    businessId, 
    new Date(startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), 
    new Date(endDate as string || new Date())
  );
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Procurement report generated successfully',
    data: result
  });
});

export const getProfitAndLossReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { startDate, endDate } = req.query;

  const result = await reportService.getProfitAndLossReport(
    businessId,
    new Date(startDate as string || new Date(new Date().getFullYear(), 0, 1)), // Default to start of year
    new Date(endDate as string || new Date())
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Profit & Loss report generated successfully',
    data: result
  });
});

export const getBalanceSheetReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { asOfDate } = req.query;

  const result = await reportService.getBalanceSheetReport(
    businessId,
    new Date(asOfDate as string || new Date())
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Balance Sheet generated successfully',
    data: result
  });
});

export const getTrialBalanceReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const result = await reportService.getTrialBalanceReport(businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Trial Balance generated successfully',
    data: result
  });
});

export const getSalesReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { startDate, endDate } = req.query;

  const result = await reportService.getSalesReport(
    businessId,
    new Date(startDate as string || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
    new Date(endDate as string || new Date())
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Sales report generated successfully',
    data: result
  });
});

export const getInventoryReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const result = await reportService.getInventoryReport(businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inventory report generated successfully',
    data: result
  });
});

export const getFinancialReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { startDate, endDate } = req.query;

  const result = await reportService.getFinancialReport(
    businessId,
    new Date(startDate as string || new Date(new Date().getFullYear(), 0, 1)),
    new Date(endDate as string || new Date())
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Financial report generated successfully',
    data: result
  });
});
