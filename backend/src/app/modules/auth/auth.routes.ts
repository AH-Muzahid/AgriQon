import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middleware/validateRequest';
import { createUserSchema, loginSchema } from './auth.validation';
import { z } from 'zod';
import { authLimiter } from '../../../middleware/authRateLimiter';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(z.object({ body: createUserSchema })),
  AuthController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(z.object({ body: loginSchema })),
  AuthController.login
);

router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);

export const AuthRoutes = router;
