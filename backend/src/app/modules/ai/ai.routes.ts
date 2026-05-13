import { Router } from 'express';
import { AiController } from './ai.controller';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = Router();

router.get(
  '/logs',
  auth(Role.ADMIN),
  AiController.getAiLogs
);

router.post(
  '/sync-embedding',
  auth(Role.ADMIN, Role.MANAGER),
  AiController.syncItemEmbedding
);

export const AiRoutes = router;
