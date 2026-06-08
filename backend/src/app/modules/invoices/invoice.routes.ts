import { Router } from 'express';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { INVOICE_VIEW, INVOICE_MANAGE } from '../../constants/permissions';
import { InvoiceController } from './invoice.controller';
import validateRequest from '../../middleware/validateRequest';
import { invoiceQuerySchema, updateInvoiceSchema } from './invoice.validation';

const router = Router();

router.use(extractAuth, requireTenant, attachBusinessRole);

router.get('/', authorizeAny(INVOICE_VIEW), validateRequest(invoiceQuerySchema), InvoiceController.getAllInvoices);
router.get('/order/:orderId', authorizeAny(INVOICE_VIEW), InvoiceController.getInvoiceByOrderId);
router.get('/:id', authorizeAny(INVOICE_VIEW), InvoiceController.getInvoiceById);
router.patch(
  '/:id',
  authorizeAny(INVOICE_MANAGE),
  validateRequest(updateInvoiceSchema),
  InvoiceController.updateInvoice
);

export const InvoiceRoutes = router;
