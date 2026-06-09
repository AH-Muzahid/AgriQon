import { Router } from 'express';
import { RoleController } from './role.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { BUSINESS_VIEW, BUSINESS_MANAGE } from '../../constants/permissions';
import validateRequest from '../../middleware/validateRequest';
import { createRoleSchema, updateRoleSchema } from './role.validation';

const router = Router();

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_VIEW),
  RoleController.getAllRoles
);

router.post(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_MANAGE),
  validateRequest(createRoleSchema),
  RoleController.createRole
);

router.patch(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_MANAGE),
  validateRequest(updateRoleSchema),
  RoleController.updateRole
);

router.delete(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BUSINESS_MANAGE),
  RoleController.deleteRole
);

export const RoleRoutes = router;
