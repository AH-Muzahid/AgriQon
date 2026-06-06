import { Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { BrandService } from './brand.service';
import { AuthRequest } from '../../middleware/rbac.middleware';

const createBrand = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const result = await BrandService.createBrand({
    ...req.body,
    businessId,
  });
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Brand created successfully',
    data: result,
  });
});

const getAllBrands = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const result = await BrandService.getAllBrands(businessId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brands fetched successfully',
    data: result,
  });
});

const getBrandById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.businessId!;
  const result = await BrandService.getBrandById(id, businessId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brand fetched successfully',
    data: result,
  });
});

const updateBrand = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.businessId!;
  const result = await BrandService.updateBrand(id, businessId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brand updated successfully',
    data: result,
  });
});

const deleteBrand = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.businessId!;
  const result = await BrandService.deleteBrand(id, businessId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Brand deleted successfully',
    data: result,
  });
});

export const BrandController = {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
};
