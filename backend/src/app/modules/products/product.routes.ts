import { Router } from 'express';
import { z } from 'zod';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryRepository } from '../inventory/inventory.repository';
import { SubscriptionGuardService } from '../subscriptions/subscription-guard.service';
import { UsageGuardService } from '../subscriptions/usage-guard.service';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
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

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const subscriptionGuard = new SubscriptionGuardService(subscriptionRepository);
const usageGuard = new UsageGuardService(subscriptionRepository);
const readOnlyGuard = new ReadOnlyGuardService(subscriptionRepository);
const productRepository = new ProductRepository();
const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);
const productService = new ProductService(
  productRepository,
  inventoryService,
  subscriptionGuard,
  usageGuard,
  readOnlyGuard
);
const productController = new ProductController(productService);

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
  productController.createProduct
);

router.get(
  '/',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_VIEW),
  productController.getAllProducts
);

router.get(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_VIEW),
  productController.getProductById
);

router.patch(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_UPDATE),
  validateRequest(z.object({ body: updateProductSchema })),
  productController.updateProduct
);

router.delete(
  '/:id',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(PRODUCT_DELETE),
  productController.deleteProduct
);

export const ProductRoutes = router;
