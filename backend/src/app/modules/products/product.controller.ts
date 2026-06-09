import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryRepository } from '../inventory/inventory.repository';
import { SubscriptionGuardService } from '../subscriptions/subscription-guard.service';
import { AuthRequest } from '../../middleware/rbac.middleware';

// Dependency Injection (Manual for now, can be moved to a container later)
const productRepository = new ProductRepository();
const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);
const subscriptionGuard = new SubscriptionGuardService();
const productService = new ProductService(productRepository, inventoryService, subscriptionGuard);

const createProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const result = await productService.createProduct({
    businessId,
    data: req.body,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

const getAllProducts = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string;
  const categoryId = req.query.categoryId as string;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

  const result = await productService.getAllProducts({
    businessId,
    page,
    limit,
    search,
    categoryId,
    minPrice,
    maxPrice,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products fetched successfully',
    meta: result.meta,
    data: result.items,
  });
});

const getProductById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.businessId!;

  const result = await productService.getProductById(id, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product fetched successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.businessId!;

  const result = await productService.updateProduct(id, businessId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const businessId = req.businessId!;

  const result = await productService.deleteProduct(id, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});

export const ProductController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
