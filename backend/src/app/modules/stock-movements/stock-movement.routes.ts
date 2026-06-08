import express from "express";
import { StockMovementController } from "./stock-movement.controller";
import {
  extractAuth,
  attachBusinessRole,
  authorizeAny,
} from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { STOCK_MOVEMENT_VIEW } from "../../constants/permissions";

const router = express.Router();

router.get(
  "/",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(STOCK_MOVEMENT_VIEW),
  StockMovementController.getMovements,
);

export const StockMovementRoutes = router;
