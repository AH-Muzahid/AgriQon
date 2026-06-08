import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { PrismaClient } from '../../../generated/client';
import { extractAuth, requireAuth } from '../../middleware/rbac.middleware';

const router = Router();
const prisma = new PrismaClient();
const repository = new NotificationRepository(prisma);
const service = new NotificationService(repository);
const controller = new NotificationController(service);

router.use(extractAuth, requireAuth);

router.get('/', (req, res) => controller.getNotifications(req, res));
router.patch('/:id/read', (req, res) => controller.markAsRead(req, res));
router.patch('/read-all', (req, res) => controller.markAllAsRead(req, res));
router.delete('/:id', (req, res) => controller.deleteNotification(req, res));

export const NotificationRoutes = router;
