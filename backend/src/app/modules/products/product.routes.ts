import { Router } from 'express';
import { z } from 'zod';
import { ProductController } from './product.controller';
import { ProductBatchController } from './batch.controller';
import validateRequest from '../../middleware/validateRequest';
import { createProductSchema, updateProductSchema } from './product.validation';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import {
  PRODUCT_VIEW,
  PRODUCT_CREATE,
  PRODUCT_UPDATE,
  PRODUCT_DELETE,
} from '../../constants/permissions';

const router = Router();

// Batches
router.get(
  '/batches',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_VIEW),
  ProductBatchController.getAllBatches
);

router.get(
  '/batches/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_VIEW),
  ProductBatchController.getBatchById
);

router.post(
  '/batches',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_CREATE),
  ProductBatchController.createBatch
);

router.delete(
  '/batches/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_DELETE),
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
