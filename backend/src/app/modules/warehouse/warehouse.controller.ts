import { Response } from "express";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { WarehouseService } from "./warehouse.service";
import { WarehouseRepository } from "./warehouse.repository";
import { AuthRequest } from "../../middleware/auth.middleware";
import { AppError } from "../../errors/AppError";

const warehouseRepository = new WarehouseRepository();
const warehouseService = new WarehouseService(warehouseRepository);

const createWarehouse = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) throw new AppError("Business ID is required", 400);

  const result = await warehouseService.createWarehouse({
    ...req.body,
    businessId,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Warehouse created successfully",
    data: result,
  });
});

const getWarehouses = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) throw new AppError("Business ID is required", 400);

  const result = await warehouseService.getWarehouses(businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Warehouses retrieved successfully",
    data: result,
  });
});

const getWarehouseById = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) throw new AppError("Business ID is required", 400);

  const result = await warehouseService.getWarehouseById(
    req.params.id,
    businessId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Warehouse retrieved successfully",
    data: result,
  });
});

const updateWarehouse = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) throw new AppError("Business ID is required", 400);

  const result = await warehouseService.updateWarehouse(
    req.params.id,
    businessId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Warehouse updated successfully",
    data: result,
  });
});

const deleteWarehouse = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) throw new AppError("Business ID is required", 400);

  const result = await warehouseService.deleteWarehouse(
    req.params.id,
    businessId,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Warehouse deleted successfully",
    data: result,
  });
});

export const WarehouseController = {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse,
  deleteWarehouse,
};
