import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authenticate } from '../../middleware/auth';
import { aiController } from './ai.controller';

export const aiRouter = Router();

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

aiRouter.use(authenticate, aiLimiter);
aiRouter.post('/search', asyncHandler(aiController.search));
aiRouter.post('/chat', asyncHandler(aiController.chat));
