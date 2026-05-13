import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { InvoiceController } from './invoice.controller';
import validateRequest from '../../middleware/validateRequest';
import { invoiceQuerySchema, updateInvoiceSchema } from './invoice.validation';
import { Role } from '../../../generated/client';

const router = Router();

router.use(auth(Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT, Role.CASHIER));

router.get('/', validateRequest(invoiceQuerySchema), InvoiceController.getAllInvoices);
router.get('/order/:orderId', InvoiceController.getInvoiceByOrderId);
router.get('/:id', InvoiceController.getInvoiceById);
router.patch(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.ACCOUNTANT),
  validateRequest(updateInvoiceSchema),
  InvoiceController.updateInvoice
);

export const InvoiceRoutes = router;
