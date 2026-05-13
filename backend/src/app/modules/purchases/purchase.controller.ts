import { Response } from 'express';
import { PurchaseService } from './purchase.service';
import { AuthRequest } from '../../middleware/rbac.middleware';
import sendResponse from '../../shared/utils/sendResponse';
import catchAsync from '../../shared/utils/catchAsync';
import { AppError } from '../../errors/AppError';

const purchaseService = new PurchaseService();

export const PurchaseController = {
  create: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await purchaseService.createPurchase(businessId, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Purchase Order created successfully',
      data: result,
    });
  }),

  getAll: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await purchaseService.getAllPurchases(businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Purchase Orders fetched successfully',
      data: result,
    });
  }),

  getById: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { id } = req.params;
    const result = await purchaseService.getPurchaseById(id, businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Purchase Order fetched successfully',
      data: result,
    });
  }),

  receive: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { id } = req.params;
    const { warehouseId } = req.body;

    if (!warehouseId) {
      throw new AppError('warehouseId is required to receive stock', 400);
    }

    const result = await purchaseService.receivePurchase(id, businessId, warehouseId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Purchase Order received and inventory updated',
      data: result,
    });
  }),

  cancel: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { id } = req.params;
    const result = await purchaseService.cancelPurchase(id, businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Purchase Order cancelled',
      data: result,
    });
  }),
};
