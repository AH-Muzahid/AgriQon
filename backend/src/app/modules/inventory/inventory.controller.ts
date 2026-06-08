import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { ValuationService } from './valuation.service';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { AppError } from '../../errors/AppError';

import { WarehouseTransferService } from './warehouse-transfer.service';

const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);
const valuationService = new ValuationService();
const transferService = new WarehouseTransferService(inventoryService);

const getInventory = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;

  const { itemId, warehouseId, batchId } = req.query;

  const result = await inventoryService.getInventory({
    businessId,
    itemId: itemId as string,
    warehouseId: warehouseId as string,
    batchId: batchId as string,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inventory retrieved successfully',
    data: result,
  });
});

const adjustStock = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;

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

const getValuation = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;

  const result = await valuationService.getTotalValuation(businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Inventory valuation retrieved successfully',
    data: result,
  });
});

const getValuationHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const { itemId } = req.params;

  const result = await valuationService.getValuationHistory(businessId, itemId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Valuation history retrieved successfully',
    data: result,
  });
});

const initiateTransfer = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;

  const result = await transferService.initiateTransfer({
    businessId,
    ...req.body
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Warehouse transfer initiated successfully',
    data: result,
  });
});

const completeTransfer = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const { id } = req.params;

  const result = await transferService.completeTransfer(businessId, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Warehouse transfer completed successfully',
    data: result,
  });
});

const getTransfers = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;

  const result = await transferService.getTransfers(businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Warehouse transfers retrieved successfully',
    data: result,
  });
});

export const InventoryController = {
  getInventory,
  adjustStock,
  getValuation,
  getValuationHistory,
  initiateTransfer,
  completeTransfer,
  getTransfers,
};
