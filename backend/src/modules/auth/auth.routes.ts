import { Router } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authController } from './auth.controller';
import { requireAuth } from '../../middleware/rbac';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));
authRouter.post('/oauth-callback', asyncHandler(authController.oauthCallback));
authRouter.get('/me', requireAuth, asyncHandler(authController.getProfile));
