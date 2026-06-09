import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { ProductService } from './product.service';
import { AuthRequest } from '../../middleware/rbac.middleware';

export class ProductController {
  constructor(private productService: ProductService) {}

  createProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const result = await this.productService.createProduct({
      businessId,
      data: req.body,
      actorId: req.user?.id,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Product created successfully',
      data: result,
    });
  });

  getAllProducts = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;

    const result = await this.productService.getAllProducts({
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

  getProductById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const businessId = req.businessId!;

    const result = await this.productService.getProductById(id, businessId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Product fetched successfully',
      data: result,
    });
  });

  updateProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const businessId = req.businessId!;

    const result = await this.productService.updateProduct(id, businessId, req.body);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Product updated successfully',
      data: result,
    });
  });

  deleteProduct = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const businessId = req.businessId!;

    const result = await this.productService.deleteProduct(id, businessId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Product deleted successfully',
      data: result,
    });
  });
}
