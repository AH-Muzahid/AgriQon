import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.notificationService.getNotifications(userId, page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.notificationService.markAsRead(id);
      res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      await this.notificationService.markAllAsRead(userId);
      res.json({ message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.notificationService.deleteNotification(id);
      res.json({ message: 'Notification deleted' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
