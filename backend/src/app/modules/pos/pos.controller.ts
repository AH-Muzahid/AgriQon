import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { PosService } from './pos.service';

export class PosController {
  constructor(private posService: PosService) {}

  calculateSummary = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const { items, discount } = req.body;

    const result = await this.posService.calculateSummary(businessId, items, discount);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Summary calculated successfully',
      data: result,
    });
  });

  checkout = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const userId = req.user!.id;
    const { customerId, items, discount, paymentMethod, dueDate } = req.body;

    const result = await this.posService.checkout({
      businessId,
      userId,
      customerId,
      items,
      discount,
      paymentMethod,
      dueDate,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'POS Checkout completed successfully',
      data: result,
    });
  });
}
