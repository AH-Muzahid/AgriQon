import express from "express";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { PaymentRepository } from "./payment.repository";
import { SubscriptionRepository } from "../subscriptions/subscription.repository";
import { ReadOnlyGuardService } from "../subscriptions/read-only-guard.service";
import {
  extractAuth,
  attachBusinessRole,
  authorizeAny,
} from "../../middleware/rbac.middleware";
import { requireTenant } from "../../middleware/tenant.middleware";
import { PAYMENT_CREATE, PAYMENT_MANAGE, PAYMENT_VIEW } from "../../constants/permissions";
import validateRequest from "../../middleware/validateRequest";
import { PaymentValidation } from "./payment.validation";

const router = express.Router();

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const readOnlyGuard = new ReadOnlyGuardService(subscriptionRepository);
const paymentRepository = new PaymentRepository();
const paymentService = new PaymentService(paymentRepository, readOnlyGuard);
const paymentController = new PaymentController(paymentService);

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
  paymentController.initiatePayment,
);

/**
 * POST /payments/webhook/:gateway
 * Gateway-signed callback — intentionally unauthenticated.
 * Signature verification is performed inside PaymentService.verifyAndHandleWebhook().
 */
router.post("/webhook/:gateway", paymentController.handleWebhook);

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
  paymentController.handleRefund,
);

/**
 * GET /payments
 * Paginated list of payments with filtering.
 * Requires: payment.view
 */
router.get(
  "/",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PAYMENT_VIEW),
  validateRequest(PaymentValidation.queryPaymentSchema),
  paymentController.getAllPayments
);

/**
 * GET /payments/:id
 * Retrieve a payment by its ID.
 * Requires: payment.view
 */
router.get(
  "/:id",
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PAYMENT_VIEW),
  paymentController.getPaymentById
);

export const PaymentRoutes = router;
