import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { OrderController } from './order.controller';
import validateRequest from '../../middleware/validateRequest';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from './order.validation';
import { Role } from '../../../generated/client';

const router = Router();

// Customer/Consumer Routes (Role.USER)
router.get('/customer', auth(Role.USER), validateRequest(orderQuerySchema), OrderController.getCustomerOrders);
router.get('/customer/:id', auth(Role.USER), OrderController.getCustomerOrderById);

// All order routes require auth
router.use(auth(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.ACCOUNTANT, Role.SELLER));

router.get('/', validateRequest(orderQuerySchema), OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);

router.post(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.SELLER),
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
  auth(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.SELLER),
  OrderController.cancelOrder
);

export const OrderRoutes = router;
