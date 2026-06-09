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

router.get(
  "/sales",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  ReportController.getSalesReport,
);

router.get(
  "/inventory",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  ReportController.getInventoryReport,
);

router.get(
  "/financial",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  ReportController.getFinancialReport,
);

export const ReportRoutes = router;
