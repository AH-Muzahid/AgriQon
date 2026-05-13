import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { NotificationService } from '../services/notification.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { PrismaClient } from '../../generated/client';
import { auth } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const repository = new NotificationRepository(prisma);
const service = new NotificationService(repository);
const controller = new NotificationController(service);

router.use(auth());

router.get('/', (req, res) => controller.getNotifications(req, res));
router.patch('/:id/read', (req, res) => controller.markAsRead(req, res));
router.patch('/read-all', (req, res) => controller.markAllAsRead(req, res));
router.delete('/:id', (req, res) => controller.deleteNotification(req, res));

export default router;
