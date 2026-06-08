import express from "express";
import { PaymentController } from "./payment.controller";
import {
  extractAuth,
  attachBusinessRole,
  authorizeAny,
} from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { PAYMENT_CREATE, PAYMENT_MANAGE } from "../../constants/permissions";

const router = express.Router();

/**
 * POST /payments/initiate
 * Initiates a payment for an order belonging to the authenticated user's tenant.
 * Requires: payment.create
 */
router.post(
  "/initiate",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PAYMENT_CREATE),
  PaymentController.initiatePayment,
);

/**
 * POST /payments/webhook/:gateway
 * Gateway-signed callback — intentionally unauthenticated.
 * Signature verification is performed inside PaymentService.verifyAndHandleWebhook().
 */
router.post("/webhook/:gateway", PaymentController.handleWebhook);

/**
 * POST /payments/refund
 * Issues a refund against an existing payment in the authenticated user's tenant.
 * Requires: payment.manage (higher privilege than payment.create)
 */
router.post(
  "/refund",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PAYMENT_MANAGE),
  PaymentController.handleRefund,
);

export const PaymentRoutes = router;
