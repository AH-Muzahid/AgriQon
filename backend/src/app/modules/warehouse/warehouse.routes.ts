import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { WarehouseValidation } from './warehouse.validation';
import { WarehouseController } from './warehouse.controller';
import { WarehouseTransferController } from './transfer.controller';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = express.Router();

router.get(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  WarehouseController.getWarehouses
);

// Transfers
router.get(
  '/transfers',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  WarehouseTransferController.getAllTransfers
);

router.get(
  '/transfers/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  WarehouseTransferController.getTransferById
);

router.post(
  '/transfers',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  WarehouseTransferController.initiateTransfer
);

router.patch(
  '/transfers/:id/status',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  WarehouseTransferController.updateTransferStatus
);

router.get(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  WarehouseController.getWarehouseById
);

router.post(
  '/',
  auth(Role.ADMIN, Role.MANAGER),
  validateRequest(WarehouseValidation.createWarehouseSchema),
  WarehouseController.createWarehouse
);

router.patch(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER),
  validateRequest(WarehouseValidation.updateWarehouseSchema),
  WarehouseController.updateWarehouse
);

export const WarehouseRoutes = router;
