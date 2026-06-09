import { Router } from 'express';
import { extractAuth, requireAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { ORDER_VIEW, ORDER_CREATE, ORDER_UPDATE } from '../../constants/permissions';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';
import { InvoiceService } from '../invoices/invoice.service';
import { InvoiceRepository } from '../invoices/invoice.repository';
import validateRequest from '../../middleware/validateRequest';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from './order.validation';

const router = Router();

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const readOnlyGuard = new ReadOnlyGuardService(subscriptionRepository);
const invoiceRepository = new InvoiceRepository();
const invoiceService = new InvoiceService(invoiceRepository, readOnlyGuard);
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository, readOnlyGuard, invoiceService);
const orderController = new OrderController(orderService);

// Customer/Consumer Routes (No Tenant/BusinessRole needed)
router.get('/customer', extractAuth, requireAuth, validateRequest(orderQuerySchema), orderController.getCustomerOrders);
router.get('/customer/:id', extractAuth, requireAuth, orderController.getCustomerOrderById);

// All other order routes require tenant and business role
router.use(extractAuth, requireTenant, attachBusinessRole);

router.get('/', authorizeAny(ORDER_VIEW), validateRequest(orderQuerySchema), orderController.getAllOrders);
router.get('/:id', authorizeAny(ORDER_VIEW), orderController.getOrderById);

router.post(
  '/',
  authorizeAny(ORDER_CREATE),
  validateRequest(createOrderSchema),
  orderController.createOrder
);

router.patch(
  '/:id/status',
  authorizeAny(ORDER_UPDATE),
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

router.patch(
  '/:id/cancel',
  authorizeAny(ORDER_UPDATE),
  orderController.cancelOrder
);

export const OrderRoutes = router;
