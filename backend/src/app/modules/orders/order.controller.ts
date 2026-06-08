import { Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AuthRequest } from '../../middleware/rbac.middleware';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { OrderStatus, Role } from '../../../generated/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';

const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);

const getAllOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status as OrderStatus | undefined;
  const customerId = req.query.customerId as string | undefined;

  const result = await orderService.getAllOrders({ businessId, status, customerId, page, limit });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Orders fetched successfully',
    meta: result.meta,
    data: result.items,
  });
});

const getOrderById = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const { id } = req.params;

  const result = await orderService.getOrderById(id, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order fetched successfully',
    data: result,
  });
});

const createOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const userId = req.user!.id;

  const result = await orderService.createOrder({
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

const updateOrderStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const { id } = req.params;
  const { status } = req.body;

  const result = await orderService.updateOrderStatus(id, businessId, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

const cancelOrder = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId!;
  const { id } = req.params;

  const result = await orderService.cancelOrder(id, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order cancelled successfully',
    data: result,
  });
});

const getCustomerOrders = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const status = req.query.status as OrderStatus | undefined;

  const result = await orderService.getCustomerOrders({ userId, status, page, limit });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Customer orders fetched successfully',
    meta: result.meta,
    data: result.items,
  });
});

const getCustomerOrderById = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const result = await orderService.getOrderByIdForUser(id, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Customer order fetched successfully',
    data: result,
  });
});

export const OrderController = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getCustomerOrders,
  getCustomerOrderById,
};

