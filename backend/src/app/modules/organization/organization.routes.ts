import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { SubscriptionGuardService } from '../subscriptions/subscription-guard.service';
import { UsageGuardService } from '../subscriptions/usage-guard.service';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import { OrganizationRepository } from './organization.repository';
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
const readOnlyGuard = new ReadOnlyGuardService(subscriptionRepository);
const organizationRepository = new OrganizationRepository();
const organizationService = new OrganizationService(
  organizationRepository,
  subscriptionGuard,
  usageGuard,
  readOnlyGuard
);
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

router.delete(
  '/users/:userId',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_MANAGE),
  organizationController.revokeUser
);

router.patch(
  '/users/:userId/role',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_MANAGE),
  organizationController.updateRole
);

export const OrganizationRoutes = router;
