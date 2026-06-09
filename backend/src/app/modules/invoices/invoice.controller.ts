import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { InvoiceService } from './invoice.service';

export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  getAllInvoices = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const customerId = req.query.customerId as string | undefined;

    const result = await this.invoiceService.getAllInvoices({ businessId, customerId, page, limit });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Invoices fetched successfully',
      meta: result.meta,
      data: result.items,
    });
  });

  getInvoiceById = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    const result = await this.invoiceService.getInvoiceById(id, businessId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Invoice fetched successfully',
      data: result,
    });
  });

  getInvoiceByOrderId = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const { orderId } = req.params;

    const result = await this.invoiceService.getInvoiceByOrderId(orderId, businessId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Invoice fetched successfully',
      data: result,
    });
  });

  updateInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    const result = await this.invoiceService.updateInvoice(id, businessId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Invoice updated successfully',
      data: result,
    });
  });
}
