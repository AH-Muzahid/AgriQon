import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { BrandController } from './brand.controller';
import { BrandValidation } from './brand.validation';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import {
  BRAND_VIEW,
  BRAND_CREATE,
  BRAND_UPDATE,
  BRAND_DELETE,
} from '../../constants/permissions';

const router = express.Router();

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BRAND_VIEW),
  BrandController.getAllBrands
);

router.get(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BRAND_VIEW),
  BrandController.getBrandById
);

router.post(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BRAND_CREATE),
  validateRequest(BrandValidation.createBrandSchema),
  BrandController.createBrand
);

router.patch(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BRAND_UPDATE),
  validateRequest(BrandValidation.updateBrandSchema),
  BrandController.updateBrand
);

router.delete(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(BRAND_DELETE),
  BrandController.deleteBrand
);

export const BrandRoutes = router;
