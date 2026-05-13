import { PrismaClient, Notification } from '../../../generated/client';

export class NotificationRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(data: {
    businessId: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: any;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        businessId: data.businessId,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
      },
    });
  }

  async findByUser(userId: string, skip = 0, take = 20): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string): Promise<any> {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string): Promise<Notification> {
    return this.prisma.notification.delete({
      where: { id },
    });
  }
}
