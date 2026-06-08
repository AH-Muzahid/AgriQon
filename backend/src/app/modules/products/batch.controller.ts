import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { ProductBatchService } from './batch.service';

const createBatch = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const result = await ProductBatchService.createBatch({
    ...req.body,
    businessId,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Product batch created successfully',
    data: result,
  });
});

const getAllBatches = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const { itemId } = req.query;
  const result = await ProductBatchService.getAllBatches(businessId, itemId as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product batches fetched successfully',
    data: result,
  });
});

const getBatchById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductBatchService.getBatchById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product batch fetched successfully',
    data: result,
  });
});

const deleteBatch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductBatchService.deleteBatch(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product batch deleted successfully',
    data: result,
  });
});

export const ProductBatchController = {
  createBatch,
  getAllBatches,
  getBatchById,
  deleteBatch,
};
