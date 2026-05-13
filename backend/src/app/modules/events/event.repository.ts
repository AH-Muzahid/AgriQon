import { Prisma, WebhookEvent, OutboxEvent } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class EventRepository {
  private prisma: Prisma.TransactionClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = tx || prisma;
  }

  // Webhook Events
  async createWebhookEvent(data: Prisma.WebhookEventUncheckedCreateInput): Promise<WebhookEvent> {
    return this.prisma.webhookEvent.create({ data });
  }

  async findWebhookEvents(businessId: string, skip: number, take: number) {
    const [items, total] = await Promise.all([
      this.prisma.webhookEvent.findMany({
        where: { businessId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.webhookEvent.count({ where: { businessId } })
    ]);
    return { items, total };
  }

  async updateWebhookStatus(id: string, status: any): Promise<WebhookEvent> {
    return this.prisma.webhookEvent.update({
      where: { id },
      data: { processingStatus: status },
    });
  }

  // Outbox Events
  async createOutboxEvent(data: Prisma.OutboxEventUncheckedCreateInput): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.create({ data });
  }

  async findUnprocessedOutboxEvents(): Promise<OutboxEvent[]> {
    return this.prisma.outboxEvent.findMany({
      where: { isProcessed: false },
      take: 100,
    });
  }

  async markOutboxAsProcessed(id: string): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: { isProcessed: true },
    });
  }
}
