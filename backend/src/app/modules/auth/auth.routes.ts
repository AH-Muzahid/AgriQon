import { Router } from 'express';
import { AuthController } from './auth.controller';
import validateRequest from '../../middleware/validateRequest';
import { createUserSchema, loginSchema } from './auth.validation';
import { z } from 'zod';
import { authLimiter } from '../../../middleware/authRateLimiter';
import { authenticate } from '../../../middleware/auth';

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
router.post('/oauth-callback', AuthController.oauthCallback);
router.get('/me', authenticate, AuthController.getMe);

export const AuthRoutes = router;
