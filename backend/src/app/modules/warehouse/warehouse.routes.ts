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
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER, Role.SELLER),
  WarehouseController.getWarehouses
);

// Transfers
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
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER, Role.SELLER),
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
