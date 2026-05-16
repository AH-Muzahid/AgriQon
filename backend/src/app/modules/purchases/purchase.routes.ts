import { Router } from 'express';
import { PurchaseController } from './purchase.controller';
import { extractAuth, authorize } from '../../middleware/rbac.middleware';
import validateRequest from '../../middleware/validateRequest';
import { createPurchaseSchema, receivePurchaseSchema } from './purchase.validation';
import { Role } from '../../../generated/client';

const router = Router();

router.post(
  '/',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER),
  validateRequest(createPurchaseSchema),
  PurchaseController.create
);

router.get(
  '/',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  PurchaseController.getAll
);

router.get(
  '/:id',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  PurchaseController.getById
);

router.post(
  '/:id/receive',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  validateRequest(receivePurchaseSchema),
  PurchaseController.receive
);

router.post(
  '/:id/cancel',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER),
  PurchaseController.cancel
);

router.post(
  '/:id/pay',
  extractAuth,
  authorize(Role.ADMIN, Role.MANAGER),
  PurchaseController.pay
);

export const PurchaseRoutes = router;
