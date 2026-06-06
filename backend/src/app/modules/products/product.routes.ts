import { Router } from 'express';
import { z } from 'zod';
import { ProductController } from './product.controller';
import { ProductBatchController } from './batch.controller';
import validateRequest from '../../middleware/validateRequest';
import { createProductSchema, updateProductSchema } from './product.validation';
import { auth } from '../../middleware/auth.middleware';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { Role } from '../../../generated/client';
import {
  PRODUCT_VIEW,
  PRODUCT_CREATE,
  PRODUCT_UPDATE,
  PRODUCT_DELETE,
} from '../../constants/permissions';

const router = Router();

// Batches — not migrated in Phase 1.3B; legacy role auth retained
router.get(
  '/batches',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  ProductBatchController.getAllBatches
);

router.get(
  '/batches/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  ProductBatchController.getBatchById
);

router.post(
  '/batches',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  ProductBatchController.createBatch
);

router.delete(
  '/batches/:id',
  auth(Role.ADMIN, Role.MANAGER, Role.WAREHOUSE_KEEPER),
  ProductBatchController.deleteBatch
);

router.post(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_CREATE),
  validateRequest(z.object({ body: createProductSchema })),
  ProductController.createProduct
);

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_VIEW),
  ProductController.getAllProducts
);

router.get(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_VIEW),
  ProductController.getProductById
);

router.patch(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_UPDATE),
  validateRequest(z.object({ body: updateProductSchema })),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_DELETE),
  ProductController.deleteProduct
);

export const ProductRoutes = router;
