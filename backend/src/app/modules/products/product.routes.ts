import { Router } from 'express';
import { z } from 'zod';
import { ProductController } from './product.controller';
import { ProductBatchController } from './batch.controller';
import validateRequest from '../../middleware/validateRequest';
import { createProductSchema, updateProductSchema } from './product.validation';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = Router();

// Batches
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
  validateRequest(z.object({ body: createProductSchema })), // Wrapped in body as per validateRequest middleware
  ProductController.createProduct
);

router.get('/', ProductController.getAllProducts);

router.get('/:id', ProductController.getProductById);

router.patch(
  '/:id',
  validateRequest(z.object({ body: updateProductSchema })),
  ProductController.updateProduct
);

router.delete('/:id', ProductController.deleteProduct);

export const ProductRoutes = router;
