import express from "express";
import validateRequest from "../../middleware/validateRequest";
import { WarehouseValidation } from "./warehouse.validation";
import { WarehouseController } from "./warehouse.controller";
import { WarehouseService } from "./warehouse.service";
import { WarehouseRepository } from "./warehouse.repository";
import { SubscriptionGuardService } from "../subscriptions/subscription-guard.service";
import { FeatureGuardService } from "../subscriptions/feature-guard.service";
import { UsageGuardService } from "../subscriptions/usage-guard.service";
import { SubscriptionRepository } from "../subscriptions/subscription.repository";
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

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const subscriptionGuard = new SubscriptionGuardService(subscriptionRepository);
const featureGuard = new FeatureGuardService(subscriptionRepository);
const usageGuard = new UsageGuardService(subscriptionRepository);
const warehouseRepository = new WarehouseRepository();
const warehouseService = new WarehouseService(
  warehouseRepository,
  subscriptionGuard,
  featureGuard,
  usageGuard
);
const warehouseController = new WarehouseController(warehouseService);

router.get(
  "/",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_VIEW),
  warehouseController.getWarehouses,
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
  warehouseController.getWarehouseById,
);

router.post(
  "/",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_CREATE),
  validateRequest(WarehouseValidation.createWarehouseSchema),
  warehouseController.createWarehouse,
);

router.patch(
  "/:id",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_UPDATE),
  validateRequest(WarehouseValidation.updateWarehouseSchema),
  warehouseController.updateWarehouse,
);

router.delete(
  "/:id",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(WAREHOUSE_DELETE),
  warehouseController.deleteWarehouse,
);

export const WarehouseRoutes = router;
