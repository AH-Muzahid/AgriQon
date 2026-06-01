import { Router } from 'express';
import { auth } from '../../middleware/auth.middleware';
import { CustomerController } from './customer.controller';
import validateRequest from '../../middleware/validateRequest';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from './customer.validation';
import { Role } from '../../../generated/client';

const router = Router();

router.use(auth(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.ACCOUNTANT, Role.SELLER));

router.get('/', validateRequest(customerQuerySchema), CustomerController.getAllCustomers);
router.get('/:id', CustomerController.getCustomerById);
router.post(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.SELLER),
  validateRequest(createCustomerSchema),
  CustomerController.createCustomer
);
router.patch(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.SELLER),
  validateRequest(updateCustomerSchema),
  CustomerController.updateCustomer
);
router.delete('/:id', auth(Role.ADMIN, Role.MANAGER), CustomerController.deleteCustomer);

export const CustomerRoutes = router;
