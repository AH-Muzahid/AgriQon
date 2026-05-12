import { Router } from 'express';
import { z } from 'zod';
import { ProductController } from './product.controller';
import validateRequest from '../../middleware/validateRequest';
import { createProductSchema, updateProductSchema } from './product.validation';

const router = Router();

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
