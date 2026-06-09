import { Router } from 'express';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { INVOICE_VIEW, INVOICE_MANAGE } from '../../constants/permissions';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './invoice.repository';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';
import validateRequest from '../../middleware/validateRequest';
import { invoiceQuerySchema, updateInvoiceSchema } from './invoice.validation';

const router = Router();

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const readOnlyGuard = new ReadOnlyGuardService(subscriptionRepository);
const invoiceRepository = new InvoiceRepository();
const invoiceService = new InvoiceService(invoiceRepository, readOnlyGuard);
const invoiceController = new InvoiceController(invoiceService);

router.use(extractAuth, requireTenant, attachBusinessRole);

router.get('/', authorizeAny(INVOICE_VIEW), validateRequest(invoiceQuerySchema), invoiceController.getAllInvoices);
router.get('/order/:orderId', authorizeAny(INVOICE_VIEW), invoiceController.getInvoiceByOrderId);
router.get('/:id', authorizeAny(INVOICE_VIEW), invoiceController.getInvoiceById);
router.patch(
  '/:id',
  authorizeAny(INVOICE_MANAGE),
  validateRequest(updateInvoiceSchema),
  invoiceController.updateInvoice
);

export const InvoiceRoutes = router;
