import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { OrderService } from './order.service';
import { OrderStatus } from '../../../generated/client';

export class OrderController {
  constructor(private orderService: OrderService) {}

  getAllOrders = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as OrderStatus | undefined;
    const customerId = req.query.customerId as string | undefined;

    const result = await this.orderService.getAllOrders({ businessId, status, customerId, page, limit });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Orders fetched successfully',
      meta: result.meta,
      data: result.items,
    });
  });

  getOrderById = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    const result = await this.orderService.getOrderById(id, businessId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Order fetched successfully',
      data: result,
    });
  });

  createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const userId = req.user!.id;

    const result = await this.orderService.createOrder({
      businessId,
      userId,
      ...req.body,
    });

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: 'Order created successfully',
      data: result,
    });
  });

  updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;
    const { status } = req.body;

    const result = await this.orderService.updateOrderStatus(id, businessId, status);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Order status updated successfully',
      data: result,
    });
  });

  cancelOrder = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId!;
    const { id } = req.params;

    const result = await this.orderService.cancelOrder(id, businessId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Order cancelled successfully',
      data: result,
    });
  });

  getCustomerOrders = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as OrderStatus | undefined;

    const result = await this.orderService.getCustomerOrders({ userId, status, page, limit });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Customer orders fetched successfully',
      meta: result.meta,
      data: result.items,
    });
  });

  getCustomerOrderById = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await this.orderService.getOrderByIdForUser(id, userId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Customer order fetched successfully',
      data: result,
    });
  });
}
