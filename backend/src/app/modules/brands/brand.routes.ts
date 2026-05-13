import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { BrandController } from './brand.controller';
import { BrandValidation } from './brand.validation';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = express.Router();

router.get(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.USER, Role.SELLER),
  BrandController.getAllBrands
);

router.get(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.USER, Role.SELLER),
  BrandController.getBrandById
);

router.post(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.SELLER),
  validateRequest(BrandValidation.createBrandSchema),
  BrandController.createBrand
);

router.patch(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.SELLER),
  validateRequest(BrandValidation.updateBrandSchema),
  BrandController.updateBrand
);

router.delete(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.SELLER),
  BrandController.deleteBrand
);

export const BrandRoutes = router;
