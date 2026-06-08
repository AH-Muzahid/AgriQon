import express from "express";
import validateRequest from "../../middleware/validateRequest";
import { WarehouseValidation } from "./warehouse.validation";
import { WarehouseController } from "./warehouse.controller";
import { WarehouseTransferController } from "./transfer.controller";
import {
  extractAuth,
  attachBusinessRole,
  authorizeAny,
} from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import {
  WAREHOUSE_VIEW,
  WAREHOUSE_CREATE,
  WAREHOUSE_UPDATE,
  WAREHOUSE_DELETE,
  STOCK_MOVEMENT_VIEW,
  STOCK_MOVEMENT_CREATE,
  STOCK_MOVEMENT_MANAGE,
} from "../../constants/permissions";

const router = express.Router();

router.get(
  "/",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_VIEW),
  WarehouseController.getWarehouses,
);

// Transfers
router.get(
  "/transfers",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(STOCK_MOVEMENT_VIEW),
  WarehouseTransferController.getAllTransfers,
);

router.get(
  "/transfers/:id",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(STOCK_MOVEMENT_VIEW),
  WarehouseTransferController.getTransferById,
);

router.post(
  "/transfers",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(STOCK_MOVEMENT_CREATE),
  validateRequest(WarehouseValidation.initiateTransferSchema),
  WarehouseTransferController.initiateTransfer,
);

router.patch(
  "/transfers/:id/status",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(STOCK_MOVEMENT_MANAGE),
  validateRequest(WarehouseValidation.updateTransferStatusSchema),
  WarehouseTransferController.updateTransferStatus,
);

router.get(
  "/:id",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_VIEW),
  WarehouseController.getWarehouseById,
);

router.post(
  "/",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_CREATE),
  validateRequest(WarehouseValidation.createWarehouseSchema),
  WarehouseController.createWarehouse,
);

router.patch(
  "/:id",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_UPDATE),
  validateRequest(WarehouseValidation.updateWarehouseSchema),
  WarehouseController.updateWarehouse,
);

router.delete(
  "/:id",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_DELETE),
  WarehouseController.deleteWarehouse,
);

export const WarehouseRoutes = router;
