import { Router } from 'express';
import { SupplierController } from './supplier.controller';
import { extractAuth, authorize } from '../../middleware/rbac.middleware';
import validateRequest from '../../middleware/validateRequest';
import { createSupplierSchema, updateSupplierSchema } from './supplier.validation';
import { Role } from '../../../generated/client';

const router = Router();

router.post(
  '/',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest(createSupplierSchema),
  SupplierController.create
);

router.get(
  '/',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  SupplierController.getAll
);

router.get(
  '/:id',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  SupplierController.getById
);

router.patch(
  '/:id',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest(updateSupplierSchema),
  SupplierController.update
);

router.delete(
  '/:id',
  extractAuth,
  authorize(Role.ADMIN),
  SupplierController.delete
);

export const SupplierRoutes = router;
