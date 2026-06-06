import { Router } from 'express';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { CustomerController } from './customer.controller';
import validateRequest from '../../middleware/validateRequest';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from './customer.validation';
import {
  CUSTOMER_VIEW,
  CUSTOMER_CREATE,
  CUSTOMER_UPDATE,
  CUSTOMER_DELETE,
} from '../../constants/permissions';

const router = Router();

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CUSTOMER_VIEW),
  validateRequest(customerQuerySchema),
  CustomerController.getAllCustomers
);

router.get(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CUSTOMER_VIEW),
  CustomerController.getCustomerById
);

router.post(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CUSTOMER_CREATE),
  validateRequest(createCustomerSchema),
  CustomerController.createCustomer
);

router.patch(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CUSTOMER_UPDATE),
  validateRequest(updateCustomerSchema),
  CustomerController.updateCustomer
);

router.delete(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CUSTOMER_DELETE),
  CustomerController.deleteCustomer
);

export const CustomerRoutes = router;
