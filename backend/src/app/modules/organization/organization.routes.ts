import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { SubscriptionGuardService } from '../subscriptions/subscription-guard.service';
import { UsageGuardService } from '../subscriptions/usage-guard.service';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { BUSINESS_VIEW, BUSINESS_MANAGE } from '../../constants/permissions';
import validateRequest from '../../middleware/validateRequest';
import { inviteUserSchema } from './organization.validation';

const router = Router();

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const subscriptionGuard = new SubscriptionGuardService(subscriptionRepository);
const usageGuard = new UsageGuardService(subscriptionRepository);
const organizationService = new OrganizationService(subscriptionGuard, usageGuard);
const organizationController = new OrganizationController(organizationService);

router.get(
  '/users',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  organizationController.getBusinessUsers
);

router.post(
  '/users/invite',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_MANAGE),
  validateRequest(inviteUserSchema),
  organizationController.inviteUser
);

export const OrganizationRoutes = router;
