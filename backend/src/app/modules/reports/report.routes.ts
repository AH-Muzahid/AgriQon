import express from "express";
import { extractAuth, attachBusinessRole, authorizeAny } from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { REPORT_VIEW } from "../../constants/permissions";
import * as ReportController from "./report.controller";

const router = express.Router();

router.get(
  "/inventory-valuation",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  ReportController.getInventoryValuationReport,
);

router.get(
  "/procurement",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  ReportController.getProcurementReport,
);

router.get(
  "/profit-loss",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  ReportController.getProfitAndLossReport,
);

router.get(
  "/balance-sheet",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  ReportController.getBalanceSheetReport,
);

router.get(
  "/trial-balance",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  ReportController.getTrialBalanceReport,
);

export const ReportRoutes = router;
