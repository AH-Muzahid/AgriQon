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

router.get(
  '/valuation',
  auth(Role.ADMIN, Role.MANAGER),
  InventoryController.getValuation
);

router.get(
  '/valuation/:itemId',
  auth(Role.ADMIN, Role.MANAGER),
  InventoryController.getValuationHistory
);

// ─── Warehouse Transfers ───────────────────────────────────────────────────

router.get(
  '/transfers',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  InventoryController.getTransfers
);

router.post(
  '/transfers',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  validateRequest(InventoryValidation.initiateTransferSchema),
  InventoryController.initiateTransfer
);

router.post(
  '/transfers/:id/complete',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  InventoryController.completeTransfer
);

export const InventoryRoutes = router;
