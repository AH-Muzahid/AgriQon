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
  '/usage',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  SubscriptionController.getSubscriptionUsage
);

export const SubscriptionRoutes = router;
