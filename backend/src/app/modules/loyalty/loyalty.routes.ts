import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import validateRequest from '../../middleware/validateRequest';
import { configureLoyaltySchema } from './loyalty.validation';
import {
  LOYALTY_CREATE,
  LOYALTY_VIEW,
  LOYALTY_MANAGE,
} from '../../constants/permissions';

const router = Router();

router.post(
  '/program',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(LOYALTY_CREATE, LOYALTY_MANAGE),
  validateRequest(configureLoyaltySchema),
  LoyaltyController.setupProgram
);

router.get(
  '/customer/:customerId/balance',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(LOYALTY_VIEW, LOYALTY_MANAGE),
  LoyaltyController.getBalance
);

export const LoyaltyRoutes = router;
