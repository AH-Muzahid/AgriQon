import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { WarehouseValidation } from './warehouse.validation';
import { WarehouseController } from './warehouse.controller';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = express.Router();

router.get(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  WarehouseController.getWarehouses
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
