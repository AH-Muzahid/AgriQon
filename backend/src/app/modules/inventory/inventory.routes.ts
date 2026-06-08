import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { InventoryValidation } from './inventory.validation';
import { InventoryController } from './inventory.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import {
  INVENTORY_VIEW,
  INVENTORY_UPDATE,
  STOCK_MOVEMENT_VIEW,
  STOCK_MOVEMENT_CREATE,
  STOCK_MOVEMENT_MANAGE,
} from '../../constants/permissions';

const router = express.Router();

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(INVENTORY_VIEW),
  InventoryController.getInventory,
);

router.post(
  '/adjust-stock',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(INVENTORY_UPDATE),
  validateRequest(InventoryValidation.adjustStockSchema),
  InventoryController.adjustStock,
);

router.get(
  '/valuation',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(INVENTORY_VIEW),
  InventoryController.getValuation,
);

router.get(
  '/valuation/:itemId',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(INVENTORY_VIEW),
  InventoryController.getValuationHistory,
);

// ─── Warehouse Transfers ───────────────────────────────────────────────────

router.get(
  '/transfers',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(STOCK_MOVEMENT_VIEW),
  InventoryController.getTransfers,
);

router.post(
  '/transfers',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(STOCK_MOVEMENT_CREATE),
  validateRequest(InventoryValidation.initiateTransferSchema),
  InventoryController.initiateTransfer,
);

router.post(
  '/transfers/:id/complete',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(STOCK_MOVEMENT_MANAGE),
  InventoryController.completeTransfer,
);

export const InventoryRoutes = router;
