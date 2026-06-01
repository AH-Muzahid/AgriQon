import { Router } from 'express';
import { AuditController } from './audit.controller';
import { auth } from '../../middleware/auth.middleware';
import { Role } from '../../../generated/client';

const router = Router();

router.get(
  '/',
  auth(Role.ADMIN, Role.MANAGER, Role.SELLER),
  AuditController.getAuditLogs
);

export const AuditRoutes = router;
