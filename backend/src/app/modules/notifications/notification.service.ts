import { NotificationRepository } from './notification.repository';
import { Notification } from '../../../generated/client';
import { Templates } from './notification.templates';
import { sendEmail } from './channels/email.channel';
import { NotificationChannel } from './notification.types';
import { prisma } from '../../lib/prisma';

export interface NotificationRecipients {
  userIds?: string[]; // For In-App
  emails?: string[];  // For Email
  phones?: string[];  // For SMS
}

/**
 * Notification Service (Delivery Layer)
 * ──────────────────────────────────────────────────────────────────────────
 * This module is PURELY for delivery. 
 * It should NEVER contain business logic, routing logic, or DB checks 
 * for "who" should receive a notification.
 * 
 * It takes a template, a payload, and a list of recipients, then delivers.
 */
export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  /**
   * Generic delivery method.
   */
  async deliver(
    templateName: keyof typeof Templates,
    payload: any,
    recipients: NotificationRecipients,
    businessId: string
  ) {
    const templateFn = Templates[templateName] as any;
    if (!templateFn) return;

    const { subject, body } = templateFn(payload);

    // 1. In-App Notifications (Persistent)
    if (recipients.userIds?.length) {
      await Promise.all(
        recipients.userIds.map(userId => 
          this.notificationRepository.create({
            businessId,
            userId,
            type: templateName,
            title: subject,
            message: body,
            metadata: payload
          })
        )
      );
    }

    // 2. Email Delivery
    if (recipients.emails?.length) {
      await Promise.all(
        recipients.emails.map(email => 
          sendEmail({
            to: email,
            subject,
            body,
            channel: NotificationChannel.EMAIL
          })
        )
      );
    }
  }

  // ─── Standard Notification Management (CRUD) ──────────────────────────────

  async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepository.findByUser(userId, skip, limit),
      this.notificationRepository.getUnreadCount(userId),
    ]);

    return {
      notifications,
      unreadCount,
      page,
      limit,
    };
  }

  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async deleteNotification(id: string) {
    return this.notificationRepository.delete(id);
  }
}

// Export singleton instance
export const notificationService = new NotificationService(new NotificationRepository(prisma));

