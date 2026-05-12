import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { OrderController } from './order.controller';
import validateRequest from '../../middleware/validateRequest';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from './order.validation';
import { Role } from '@prisma/client';

const router = Router();

// All order routes require auth
router.use(auth(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.ACCOUNTANT, Role.SELLER));

router.get('/', validateRequest(orderQuerySchema), OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);

router.post(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.CASHIER),
  validateRequest(createOrderSchema),
  OrderController.createOrder
);

router.patch(
  '/:id/status',
  auth(Role.ADMIN, Role.MANAGER),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

router.patch(
  '/:id/cancel',
  auth(Role.ADMIN, Role.MANAGER, Role.CASHIER),
  OrderController.cancelOrder
);

export const OrderRoutes = router;
