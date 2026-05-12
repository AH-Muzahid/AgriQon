import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { StockMovementService } from './stock-movement.service';
import { StockMovementRepository } from './stock-movement.repository';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../errors/AppError';

const stockMovementRepository = new StockMovementRepository();
const stockMovementService = new StockMovementService(stockMovementRepository);

const getMovements = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) throw new AppError('Business ID is required', 400);

  const { inventoryId, itemId, warehouseId, limit, skip } = req.query;

  const result = await stockMovementService.getMovements({
    businessId,
    inventoryId: inventoryId as string,
    itemId: itemId as string,
    warehouseId: warehouseId as string,
    limit: limit ? Number(limit) : undefined,
    skip: skip ? Number(skip) : undefined,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Stock movements retrieved successfully',
    data: result,
  });
});

export const StockMovementController = {
  getMovements,
};
