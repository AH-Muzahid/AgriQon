import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { WarehouseTransferService } from './transfer.service';

const initiateTransfer = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const result = await WarehouseTransferService.initiateTransfer({
    ...req.body,
    businessId,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Warehouse transfer initiated successfully',
    data: result,
  });
});

const getAllTransfers = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const result = await WarehouseTransferService.getAllTransfers(businessId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Warehouse transfers fetched successfully',
    data: result,
  });
});

const getTransferById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WarehouseTransferService.getTransferById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Warehouse transfer fetched successfully',
    data: result,
  });
});

const updateTransferStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await WarehouseTransferService.updateTransferStatus(id, status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Warehouse transfer status updated successfully',
    data: result,
  });
});

export const WarehouseTransferController = {
  initiateTransfer,
  getAllTransfers,
  getTransferById,
  updateTransferStatus,
};
