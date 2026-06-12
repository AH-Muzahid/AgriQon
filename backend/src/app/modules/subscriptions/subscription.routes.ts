import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { BUSINESS_VIEW } from '../../constants/permissions';

const router = Router();

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getSubscription
);

router.get(
  '/current',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getCurrentSubscription
);

router.get(
  '/usage',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getSubscriptionUsage
);

router.get(
  '/features',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getSubscriptionFeatures
);

router.get(
  '/billing',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getBillingOverview
);

router.get(
  '/invoices',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getInvoices
);

router.get(
  '/payments',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getPayments
);

router.get(
  '/history',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getHistory
);

router.post(
  '/upgrade-request',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.postUpgradeRequest
);

router.post(
  '/renewal-request',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.postRenewalRequest
);

router.post(
  '/payment-session',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.postPaymentSession
);

router.get(
  '/payments/:id/status',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getPaymentStatus
);

export const SubscriptionRoutes = router;
