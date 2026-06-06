import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import {
  CATEGORY_VIEW,
  CATEGORY_CREATE,
  CATEGORY_UPDATE,
  CATEGORY_DELETE,
} from '../../constants/permissions';

const router = express.Router();

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CATEGORY_VIEW),
  CategoryController.getAllCategories
);

router.get(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CATEGORY_VIEW),
  CategoryController.getCategoryById
);

router.post(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CATEGORY_CREATE),
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CATEGORY_UPDATE),
  validateRequest(CategoryValidation.updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(CATEGORY_DELETE),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
