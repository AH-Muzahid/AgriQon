import { Prisma, WebhookEvent, OutboxEvent } from '../../../generated/client';
import { prisma } from '../../lib/prisma';
import { outboxProcessor } from '../../../shared/events/outbox.processor';

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
      data: { status },
    });
  }

  // Outbox Events
  async createOutboxEvent(data: Prisma.OutboxEventUncheckedCreateInput): Promise<OutboxEvent> {
    const event = await this.prisma.outboxEvent.create({ data });
    
    // Trigger the outbox processor to handle the new event immediately
    outboxProcessor.trigger();
    
    return event;
  }

  async findUnprocessedOutboxEvents(): Promise<OutboxEvent[]> {
    return this.prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      take: 100,
    });
  }

  async markOutboxAsProcessed(id: string): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        processedAt: new Date()
      },
    });
  }
}

