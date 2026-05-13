import { Router } from 'express';
import { LoyaltyController } from './loyalty.controller';
import { extractAuth, authorize } from '../../middleware/rbac.middleware';
import validateRequest from '../../middleware/validateRequest';
import { configureLoyaltySchema } from './loyalty.validation';
import { Role } from '../../../generated/client';

const router = Router();

router.post(
  '/program',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest(configureLoyaltySchema),
  LoyaltyController.setupProgram
);

router.get(
  '/customer/:customerId/balance',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER, Role.CASHIER),
  LoyaltyController.getBalance
);

export const LoyaltyRoutes = router;
