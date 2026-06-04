import { Router } from 'express';
import { SupplierController } from './supplier.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import validateRequest from '../../middleware/validateRequest';
import { createSupplierSchema, updateSupplierSchema } from './supplier.validation';
import {
  SUPPLIER_CREATE,
  SUPPLIER_VIEW,
  SUPPLIER_UPDATE,
  SUPPLIER_DELETE,
  SUPPLIER_MANAGE,
} from '../../constants/permissions';

const router = Router();

router.post(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(SUPPLIER_CREATE, SUPPLIER_MANAGE),
  validateRequest(createSupplierSchema),
  SupplierController.create
);

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(SUPPLIER_VIEW, SUPPLIER_MANAGE),
  SupplierController.getAll
);

router.get(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(SUPPLIER_VIEW, SUPPLIER_MANAGE),
  SupplierController.getById
);

router.patch(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(SUPPLIER_UPDATE, SUPPLIER_MANAGE),
  validateRequest(updateSupplierSchema),
  SupplierController.update
);

router.delete(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(SUPPLIER_DELETE, SUPPLIER_MANAGE),
  SupplierController.delete
);

export const SupplierRoutes = router;
