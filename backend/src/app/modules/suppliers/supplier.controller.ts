import { Response } from 'express';
import { SupplierService } from './supplier.service';
import { AuthRequest } from '../../middleware/rbac.middleware';
import sendResponse from '../../shared/utils/sendResponse';
import catchAsync from '../../shared/utils/catchAsync';

const supplierService = new SupplierService();

export const SupplierController = {
  create: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await supplierService.createSupplier(businessId, req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Supplier created successfully',
      data: result,
    });
  }),

  getAll: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const result = await supplierService.getAllSuppliers(businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Suppliers fetched successfully',
      data: result,
    });
  }),

  getById: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { id } = req.params;
    const result = await supplierService.getSupplierById(id, businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Supplier fetched successfully',
      data: result,
    });
  }),

  update: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { id } = req.params;
    const result = await supplierService.updateSupplier(id, businessId, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Supplier updated successfully',
      data: result,
    });
  }),

  delete: catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId as string;
    const { id } = req.params;
    const result = await supplierService.deleteSupplier(id, businessId);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Supplier deleted successfully',
      data: result,
    });
  }),
};
