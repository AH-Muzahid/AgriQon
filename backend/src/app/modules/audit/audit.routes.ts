import { Router } from "express";
import { AuditController } from "./audit.controller";
import { extractAuth, attachBusinessRole, authorizeAny } from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { AUDIT_VIEW } from "../../constants/permissions";

const router = Router();

router.get(
  "/",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(AUDIT_VIEW),
  AuditController.getAuditLogs
);

export const AuditRoutes = router;
