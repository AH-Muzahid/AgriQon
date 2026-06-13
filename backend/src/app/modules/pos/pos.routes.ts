import { Router } from 'express';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { ORDER_CREATE, ORDER_VIEW } from '../../constants/permissions';
import { OrderService } from '../orders/order.service';
import { OrderRepository } from '../orders/order.repository';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';
import { InvoiceService } from '../invoices/invoice.service';
import { InvoiceRepository } from '../invoices/invoice.repository';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';

const router = Router();

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const readOnlyGuard = new ReadOnlyGuardService(subscriptionRepository);
const invoiceRepository = new InvoiceRepository();
const invoiceService = new InvoiceService(invoiceRepository, readOnlyGuard);
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository, readOnlyGuard, invoiceService);

const posService = new PosService(orderService);
const posController = new PosController(posService);

// POS Routes require tenant context and business role mapping
router.use(extractAuth, requireTenant, attachBusinessRole);

router.post(
  '/calculate-summary',
  authorizeAny(ORDER_VIEW, ORDER_CREATE),
  posController.calculateSummary
);

router.post(
  '/checkout',
  authorizeAny(ORDER_CREATE),
  posController.checkout
);

export const PosRoutes = router;
