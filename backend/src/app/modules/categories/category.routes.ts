import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = express.Router();

router.get(
  '/',
  CategoryController.getAllCategories
);

router.get(
  '/:id',
  CategoryController.getCategoryById
);

router.post(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.SELLER),
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.SELLER),
  validateRequest(CategoryValidation.updateCategorySchema),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.SELLER),
  CategoryController.deleteCategory
);

export const CategoryRoutes = router;
