import { Router } from 'express';
import { PermissionController } from './permission.controller';
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
  PermissionController.getPermissionsMetadata
);

export const PermissionRoutes = router;
