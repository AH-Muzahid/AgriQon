import { Request, Response } from "express";
import catchAsync from "../../shared/utils/catchAsync";
import sendResponse from "../../shared/utils/sendResponse";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";
import { AuthRequest } from "../../middleware/rbac.middleware";
import { AppError } from "../../errors/AppError";

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  /**
   * POST /payments/initiate
   * Threads businessId from the tenant context into the payment payload so the
   * payment record is correctly scoped to the authenticated user's business.
   */
  initiatePayment = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId;
    if (!businessId) throw new AppError("Business context required", 400);

    const result = await this.paymentService.initiatePayment({
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
  handleWebhook = catchAsync(async (req: Request, res: Response) => {
    const { gateway } = req.params;

    const payload = {
      body: req.body,
      headers: req.headers,
      rawBody: (req as any).rawBody,
    };

    const result = await this.paymentService.verifyAndHandleWebhook(gateway, payload);

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
   */
  handleRefund = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId;
    if (!businessId) throw new AppError("Business context required", 400);

    const result = await this.paymentService.handleRefund(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Refund processed successfully",
      data: result,
    });
  });

  getAllPayments = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId;
    if (!businessId) throw new AppError("Business context required", 400);

    const filters = req.query;

    const result = await this.paymentService.getAllPayments({
      businessId,
      page: Number(filters.page || 1),
      limit: Number(filters.limit || 10),
      startDate: filters.startDate as string | undefined,
      endDate: filters.endDate as string | undefined,
      status: filters.status as any,
      invoiceId: filters.invoiceId as string | undefined,
      customerId: filters.customerId as string | undefined,
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payments retrieved successfully",
      meta: {
        page: Number(filters.page || 1),
        limit: Number(filters.limit || 10),
        total: result.total,
      },
      data: result.items,
    });
  });

  getPaymentById = catchAsync(async (req: AuthRequest, res: Response) => {
    const businessId = req.businessId;
    if (!businessId) throw new AppError("Business context required", 400);

    const { id } = req.params;
    const result = await this.paymentService.getPaymentById(id, businessId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Payment retrieved successfully",
      data: result,
    });
  });
}
