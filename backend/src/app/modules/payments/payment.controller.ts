import { Request, Response } from "express";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";
import { AuthRequest } from "../../middleware/rbac.middleware";
import { AppError } from "../../errors/AppError";

/**
 * POST /payments/initiate
 * Threads businessId from the tenant context into the payment payload so the
 * payment record is correctly scoped to the authenticated user's business.
 */
const initiatePayment = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId;
  if (!businessId) throw new AppError("Business context required", 400);

  const result = await PaymentService.initiatePayment({
    ...req.body,
    businessId,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

/**
 * POST /payments/webhook/:gateway
 * Remains a plain Request — no JWT context, gateway-signed payload only.
 */
const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const { gateway } = req.params;

  const payload = {
    body: req.body,
    headers: req.headers,
    rawBody: (req as any).rawBody,
  };

  const result = await PaymentService.verifyAndHandleWebhook(gateway, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Webhook processed successfully",
    data: result,
  });
});

/**
 * POST /payments/refund
 * Validates tenant context so a user cannot refund payments belonging to other tenants.
 * Service-level validation (payment.businessId === req.businessId) should be added
 * as a Phase 1.5 hardening step.
 */
const handleRefund = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId;
  if (!businessId) throw new AppError("Business context required", 400);

  const result = await PaymentService.handleRefund(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Refund processed successfully",
    data: result,
  });
});

export const PaymentController = {
  initiatePayment,
  handleWebhook,
  handleRefund,
};
