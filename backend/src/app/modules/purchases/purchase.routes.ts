import { Router } from 'express';
import { PurchaseController } from './purchase.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import validateRequest from '../../middleware/validateRequest';
import { createPurchaseSchema, receivePurchaseSchema } from './purchase.validation';
import {
  PURCHASE_CREATE,
  PURCHASE_VIEW,
  PURCHASE_UPDATE,
  PURCHASE_MANAGE,
} from '../../constants/permissions';

const router = Router();

router.post(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PURCHASE_CREATE, PURCHASE_MANAGE),
  validateRequest(createPurchaseSchema),
  PurchaseController.create
);

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PURCHASE_VIEW, PURCHASE_MANAGE),
  PurchaseController.getAll
);

router.get(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PURCHASE_VIEW, PURCHASE_MANAGE),
  PurchaseController.getById
);

router.post(
  '/:id/receive',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PURCHASE_UPDATE, PURCHASE_MANAGE),
  validateRequest(receivePurchaseSchema),
  PurchaseController.receive
);

router.post(
  '/:id/cancel',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PURCHASE_UPDATE, PURCHASE_MANAGE),
  PurchaseController.cancel
);

router.post(
  '/:id/pay',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PURCHASE_UPDATE, PURCHASE_MANAGE),
  PurchaseController.pay
);

export const PurchaseRoutes = router;
