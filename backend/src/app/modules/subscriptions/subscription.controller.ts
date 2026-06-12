import { Response } from 'express';
import { AuthRequest } from '../../middleware/rbac.middleware';
import catchAsync from '../../shared/utils/catchAsync';
import { sendResponse } from '../../shared/utils/sendResponse';
import { SubscriptionService } from './subscription.service';
import httpStatus from 'http-status';
import { AppError } from '../../errors/AppError';
import { BillingService } from './billing.service';
import { PaymentWebhookService } from './payment-webhook.service';
import { SaaSAnalyticsService } from './saas-analytics.service';
import { SaaSAdminService } from './saas-admin.service';

const subscriptionService = new SubscriptionService();
const billingService = new BillingService();
const webhookService = new PaymentWebhookService();
const saasAnalyticsService = new SaaSAnalyticsService();
const saasAdminService = new SaaSAdminService();

const getSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await subscriptionService.getSubscription(businessId);

  const compatibleResult = result ? {
    ...result,
    startDate: (result as any).startsAt,
    endDate: (result as any).expiresAt,
    trialStart: (result as any).startsAt,
    trialEnd: (result as any).trialEndsAt || (result as any).expiresAt,
  } : result;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription details retrieved successfully',
    data: compatibleResult,
  });
});

const getSubscriptionUsage = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await subscriptionService.getSubscriptionUsageLimits(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription usage details retrieved successfully',
    data: result,
  });
});

const getCurrentSubscription = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await subscriptionService.getCurrentSubscription(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Current subscription details retrieved successfully',
    data: result,
  });
});

const getSubscriptionFeatures = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await subscriptionService.getSubscriptionFeatures(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Subscription features retrieved successfully',
    data: result,
  });
});



const getBillingOverview = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await billingService.getBillingHistory(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Billing overview retrieved successfully',
    data: result,
  });
});

const getInvoices = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { invoices } = await billingService.getBillingHistory(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Invoices retrieved successfully',
    data: invoices,
  });
});

const getPayments = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { payments } = await billingService.getBillingHistory(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments retrieved successfully',
    data: payments,
  });
});

const getHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const result = await billingService.getBillingHistory(businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Billing history retrieved successfully',
    data: result,
  });
});

const postUpgradeRequest = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { requestedPlanCode } = req.body;
  if (!requestedPlanCode) {
    throw new AppError('requestedPlanCode is required', httpStatus.BAD_REQUEST);
  }

  const subscription = await subscriptionService.getSubscription(businessId);
  if (!subscription) {
    throw new AppError('Active subscription not found', httpStatus.NOT_FOUND);
  }

  const result = await billingService.createUpgradeRequest({
    businessId,
    subscriptionId: subscription.id,
    requestedPlanCode,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Upgrade request submitted successfully',
    data: result,
  });
});

const postRenewalRequest = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { requestedPlanCode } = req.body;
  if (!requestedPlanCode) {
    throw new AppError('requestedPlanCode is required', httpStatus.BAD_REQUEST);
  }

  const subscription = await subscriptionService.getSubscription(businessId);
  if (!subscription) {
    throw new AppError('Active subscription not found', httpStatus.NOT_FOUND);
  }

  const result = await billingService.createRenewalRequest({
    businessId,
    subscriptionId: subscription.id,
    requestedPlanCode,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Renewal request submitted successfully',
    data: result,
  });
});

const postPaymentSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { invoiceId, gateway } = req.body;
  if (!invoiceId || !gateway) {
    throw new AppError('invoiceId and gateway are required', httpStatus.BAD_REQUEST);
  }

  const result = await billingService.createPaymentSession({
    businessId,
    invoiceId,
    gateway,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment session created successfully',
    data: result,
  });
});

const postWebhook = catchAsync(async (req: Response | any, res: Response) => {
  const { gateway } = req.params;
  const result = await webhookService.handleWebhook({
    gateway,
    payload: req.body,
    headers: req.headers,
  });

  sendResponse(res, {
    statusCode: result.success ? httpStatus.OK : httpStatus.BAD_REQUEST,
    success: result.success,
    message: result.success ? 'Webhook processed successfully' : result.reason || 'Webhook processing failed',
    data: result.payment || null,
  });
});

const getPaymentStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.businessId || req.user?.businessId;
  if (!businessId) {
    throw new AppError('Business Context is required', httpStatus.BAD_REQUEST);
  }

  const { id } = req.params;
  if (!id) {
    throw new AppError('Payment ID parameter is required', httpStatus.BAD_REQUEST);
  }

  const result = await billingService.getPaymentStatus(id, businessId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment status retrieved successfully',
    data: result,
  });
});

const getAdminAnalyticsSummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await saasAnalyticsService.getSaaSSummary();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'SaaS admin analytics summary retrieved successfully',
    data: result,
  });
});

const getAdminTenants = catchAsync(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const planCode = req.query.planCode as string;
  const status = req.query.status as any;
  const search = req.query.search as string;
  const sortBy = req.query.sortBy as any;
  const sortOrder = req.query.sortOrder as any;

  const result = await saasAdminService.listTenants({
    page,
    limit,
    planCode,
    status,
    search,
    sortBy,
    sortOrder,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tenants list retrieved successfully',
    data: result,
  });
});

const postAdminTenantOverride = catchAsync(async (req: AuthRequest, res: Response) => {
  const { businessId } = req.params;
  const { planCode, expiresAt, status, reason } = req.body;
  if (!businessId) {
    throw new AppError('Business ID is required', httpStatus.BAD_REQUEST);
  }
  const result = await saasAdminService.overrideTenantSubscription(businessId, {
    planCode,
    expiresAt,
    status,
    reason,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Tenant subscription overridden successfully',
    data: result,
  });
});

const getAdminOverrideHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const { businessId } = req.params;
  const result = await saasAdminService.getOverrideHistory(businessId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Manual override history retrieved successfully',
    data: result,
  });
});

export const SubscriptionController = {
  getSubscription,
  getSubscriptionUsage,
  getCurrentSubscription,
  getSubscriptionFeatures,
  getBillingOverview,
  getInvoices,
  getPayments,
  getHistory,
  postUpgradeRequest,
  postRenewalRequest,
  postPaymentSession,
  postWebhook,
  getPaymentStatus,
  getAdminAnalyticsSummary,
  getAdminTenants,
  postAdminTenantOverride,
  getAdminOverrideHistory,
};

