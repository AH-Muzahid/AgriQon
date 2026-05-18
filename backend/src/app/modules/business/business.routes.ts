import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { BusinessValidation } from './business.validation';
import { BusinessController } from './business.controller';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = express.Router();

router.get(
  '/my-business',
  auth(Role.ADMIN, Role.MANAGER, Role.USER),
  BusinessController.getMyBusiness
);

router.get(
  '/public',
  BusinessController.getAllBusinesses
);

router.get(
  '/',
  auth(Role.ADMIN, Role.MANAGER),
  BusinessController.getBusinessesByOrganization
);

router.post(
  '/',
  auth(Role.ADMIN, Role.MANAGER),
  validateRequest(BusinessValidation.createBusinessSchema),
  BusinessController.createBusiness
);

router.patch(
  '/:id',
  auth(Role.ADMIN, Role.MANAGER),
  validateRequest(BusinessValidation.updateBusinessSchema),
  BusinessController.updateBusiness
);

router.delete(
  '/:id',
  auth(Role.ADMIN),
  BusinessController.deleteBusiness
);

export const BusinessRoutes = router;
