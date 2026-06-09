import { Response } from "express";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import { WarehouseService } from "./warehouse.service";
import { AuthRequest } from "../../middleware/rbac.middleware";
import { AppError } from "../../errors/AppError";

export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  createWarehouse = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId;
    if (!businessId) throw new AppError("Business ID is required", 400);

    const result = await this.warehouseService.createWarehouse({
      ...req.body,
      businessId,
    }, req.user?.id);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Warehouse created successfully",
      data: result,
    });
  });

  getWarehouses = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId;
    if (!businessId) throw new AppError("Business ID is required", 400);

    const result = await this.warehouseService.getWarehouses(businessId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Warehouses retrieved successfully",
      data: result,
    });
  });

  getWarehouseById = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId;
    if (!businessId) throw new AppError("Business ID is required", 400);

    const result = await this.warehouseService.getWarehouseById(
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

  updateWarehouse = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId;
    if (!businessId) throw new AppError("Business ID is required", 400);

    const result = await this.warehouseService.updateWarehouse(
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

  deleteWarehouse = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.user?.businessId;
    if (!businessId) throw new AppError("Business ID is required", 400);

    const result = await this.warehouseService.deleteWarehouse(
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
}
