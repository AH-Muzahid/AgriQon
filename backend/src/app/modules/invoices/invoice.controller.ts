import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AuthRequest } from '../../middleware/auth.middleware';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';

const invoiceRepository = new InvoiceRepository();
const invoiceService = new InvoiceService(invoiceRepository);

const getAllInvoices = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const customerId = req.query.customerId as string | undefined;

  const result = await invoiceService.getAllInvoices({ businessId, customerId, page, limit });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Invoices fetched successfully',
    meta: result.meta,
    data: result.items,
  });
});

const getInvoiceById = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { id } = req.params;

  const result = await invoiceService.getInvoiceById(id, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Invoice fetched successfully',
    data: result,
  });
});

const getInvoiceByOrderId = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { orderId } = req.params;

  const result = await invoiceService.getInvoiceByOrderId(orderId, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Invoice fetched successfully',
    data: result,
  });
});

const updateInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { id } = req.params;

  const result = await invoiceService.updateInvoice(id, businessId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Invoice updated successfully',
    data: result,
  });
});

export const InvoiceController = {
  getAllInvoices,
  getInvoiceById,
  getInvoiceByOrderId,
  updateInvoice,
};
