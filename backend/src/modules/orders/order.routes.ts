import { Role } from '@prisma/client';
import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { orderController } from './order.controller';

export const orderRouter = Router();

orderRouter.use(authenticate);
orderRouter.get('/', asyncHandler(orderController.list));
orderRouter.post('/', asyncHandler(orderController.create));
orderRouter.patch('/:id/status', authorize(Role.ADMIN), asyncHandler(orderController.updateStatus));
