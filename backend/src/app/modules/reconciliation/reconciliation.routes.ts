import { Router } from "express";
import { ReconciliationController } from "./reconciliation.controller";
import {
  extractAuth,
  requireAuth,
  attachBusinessRole,
  authorizeAny,
  requirePlatformAdmin,
} from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import {
  RECONCILIATION_VIEW,
  RECONCILIATION_MANAGE,
} from "../../constants/permissions";

const router = Router();
const controller = new ReconciliationController();

// ─── Tenant-scoped routes ────────────────────────────────────────────────────
// businessId is derived from the authenticated user's JWT via requireTenant.
// A user can only inspect reconciliation data for their own tenant.

/**
 * GET /reconciliation/history
 * Returns reconciliation history for the authenticated user's tenant.
 * Requires: reconciliation.view
 */
router.get(
  "/history",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(RECONCILIATION_VIEW),
  (req, res) => controller.getHistory(req, res),
);

/**
 * GET /reconciliation/check
 * Runs an integrity check on the authenticated user's tenant.
 * Replaces the old /:businessId route which allowed MANAGER to probe any tenant.
 * Requires: reconciliation.manage
 */
router.get(
  "/check",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(RECONCILIATION_MANAGE),
  (req, res) => controller.checkTenantIntegrity(req, res),
);

// ─── Platform-admin routes ───────────────────────────────────────────────────
// These operate outside of tenant scope and require platform-level admin access.
// businessId is taken from the URL param or request body; the caller must be ADMIN.

/**
 * GET /reconciliation/global
 * Runs reconciliation across all tenants. Platform admin only.
 */
router.get(
  "/global",
  extractAuth,
  requireAuth,
  requirePlatformAdmin,
  (req, res) => controller.globalCheck(req, res),
);

/**
 * GET /reconciliation/:businessId
 * Runs an integrity check on a specific tenant by ID. Platform admin only.
 * The businessId comes from the URL — safe only because requirePlatformAdmin
 * prevents any non-admin user from reaching this handler.
 */
router.get(
  "/:businessId",
  extractAuth,
  requireAuth,
  requirePlatformAdmin,
  (req, res) => controller.checkIntegrity(req, res),
);

/**
 * POST /reconciliation/fix/inventory
 * Fixes inventory drift for a specific business. Platform admin only.
 */
router.post(
  "/fix/inventory",
  extractAuth,
  requireAuth,
  requirePlatformAdmin,
  (req, res) => controller.fixInventory(req, res),
);

/**
 * POST /reconciliation/fix/account
 * Fixes account balance drift. Platform admin only.
 */
router.post(
  "/fix/account",
  extractAuth,
  requireAuth,
  requirePlatformAdmin,
  (req, res) => controller.fixAccount(req, res),
);

/**
 * POST /reconciliation/fix/outbox
 * Retries stale outbox events. Platform admin only.
 */
router.post(
  "/fix/outbox",
  extractAuth,
  requireAuth,
  requirePlatformAdmin,
  (req, res) => controller.retryOutbox(req, res),
);

export const ReconciliationRoutes = router;
