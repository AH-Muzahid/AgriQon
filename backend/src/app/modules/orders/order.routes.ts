import { Router } from 'express';
import { extractAuth, requireAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { ORDER_VIEW, ORDER_CREATE, ORDER_UPDATE } from '../../constants/permissions';
import { OrderController } from './order.controller';
import validateRequest from '../../middleware/validateRequest';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from './order.validation';

const router = Router();

// Customer/Consumer Routes (No Tenant/BusinessRole needed)
router.get('/customer', extractAuth, requireAuth, validateRequest(orderQuerySchema), OrderController.getCustomerOrders);
router.get('/customer/:id', extractAuth, requireAuth, OrderController.getCustomerOrderById);

// All other order routes require tenant and business role
router.use(extractAuth, requireTenant, attachBusinessRole);

router.get('/', authorizeAny(ORDER_VIEW), validateRequest(orderQuerySchema), OrderController.getAllOrders);
router.get('/:id', authorizeAny(ORDER_VIEW), OrderController.getOrderById);

router.post(
  '/',
  authorizeAny(ORDER_CREATE),
  validateRequest(createOrderSchema),
  OrderController.createOrder
);

router.patch(
  '/:id/status',
  authorizeAny(ORDER_UPDATE),
  validateRequest(updateOrderStatusSchema),
  OrderController.updateOrderStatus
);

router.patch(
  '/:id/cancel',
  authorizeAny(ORDER_UPDATE),
  OrderController.cancelOrder
);

export const OrderRoutes = router;
