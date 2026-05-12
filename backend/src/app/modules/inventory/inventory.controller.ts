import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../errors/AppError';

const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);

const getInventory = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;

  if (!businessId) {
    throw new AppError('Business ID is required', 400);
  }

  const { itemId, warehouseId } = req.query;

  const result = await inventoryService.getInventory({
    businessId,
    itemId: itemId as string,
    warehouseId: warehouseId as string,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inventory retrieved successfully',
    data: result,
  });
});

const adjustStock = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;

  if (!businessId) {
    throw new AppError('Business ID is required for this operation', 400);
  }

  const result = await inventoryService.adjustStock({
    businessId,
    ...req.body,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Stock adjusted successfully',
    data: result,
  });
});

export const InventoryController = {
  getInventory,
  adjustStock,
};
