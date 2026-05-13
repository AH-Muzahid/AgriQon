import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { InventoryValidation } from './inventory.validation';
import { InventoryController } from './inventory.controller';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = express.Router();

router.get(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER, Role.SELLER),
  InventoryController.getInventory
);

router.post(
  '/adjust-stock',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  validateRequest(InventoryValidation.adjustStockSchema),
  InventoryController.adjustStock
);

export const InventoryRoutes = router;
