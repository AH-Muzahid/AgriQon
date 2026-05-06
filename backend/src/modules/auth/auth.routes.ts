import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authController } from './auth.controller';
import { requireAuth } from '../../middleware/rbac';
import { authLimiter, oauthLimiter } from '../../middleware/authRateLimiter';

export const authRouter = Router();

authRouter.post('/register', authLimiter, asyncHandler(authController.register));
authRouter.post('/login', authLimiter, asyncHandler(authController.login));
authRouter.post('/oauth-callback', oauthLimiter, asyncHandler(authController.oauthCallback));
authRouter.get('/me', requireAuth, asyncHandler(authController.getProfile));
