import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { BUSINESS_VIEW, BUSINESS_MANAGE } from '../../constants/permissions';
import validateRequest from '../../middleware/validateRequest';
import { inviteUserSchema } from './organization.validation';

const router = Router();

router.get(
  '/users',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  OrganizationController.getBusinessUsers
);

router.post(
  '/users/invite',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_MANAGE),
  validateRequest(inviteUserSchema),
  OrganizationController.inviteUser
);

export const OrganizationRoutes = router;
