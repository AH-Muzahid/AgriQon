import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { BusinessValidation } from './business.validation';
import { BusinessController } from './business.controller';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router();

router.get(
  '/my-business',
  auth(Role.ADMIN, Role.MANAGER, Role.SELLER),
  BusinessController.getMyBusiness
);

router.post(
  '/',
  auth(Role.ADMIN), // Only global admin or superuser should create businesses normally
  validateRequest(BusinessValidation.createBusinessSchema),
  BusinessController.createBusiness
);

export const BusinessRoutes = router;
