import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { WarehouseValidation } from './warehouse.validation';
import { WarehouseController } from './warehouse.controller';
import { WarehouseTransferController } from './transfer.controller';
import { auth } from '../../middleware/auth.middleware';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { Role } from '../../../generated/client';
import {
  WAREHOUSE_VIEW,
  WAREHOUSE_CREATE,
  WAREHOUSE_UPDATE,
} from '../../constants/permissions';

const router = express.Router();

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_VIEW),
  WarehouseController.getWarehouses
);

// Transfers — not migrated in Phase 1.3B; legacy role auth retained
router.get(
  '/transfers',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER, Role.SELLER),
  WarehouseTransferController.getAllTransfers
);

router.get(
  '/transfers/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER, Role.SELLER),
  WarehouseTransferController.getTransferById
);

router.post(
  '/transfers',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER, Role.SELLER),
  validateRequest(WarehouseValidation.initiateTransferSchema),
  WarehouseTransferController.initiateTransfer
);

router.patch(
  '/transfers/:id/status',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER, Role.SELLER),
  validateRequest(WarehouseValidation.updateTransferStatusSchema),
  WarehouseTransferController.updateTransferStatus
);

router.get(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_VIEW),
  WarehouseController.getWarehouseById
);

router.post(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_CREATE),
  validateRequest(WarehouseValidation.createWarehouseSchema),
  WarehouseController.createWarehouse
);

router.patch(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_UPDATE),
  validateRequest(WarehouseValidation.updateWarehouseSchema),
  WarehouseController.updateWarehouse
);

export const WarehouseRoutes = router;
