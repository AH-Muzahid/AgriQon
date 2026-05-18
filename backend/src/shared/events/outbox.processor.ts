import { prisma } from '../../app/lib/prisma';
import { ProcessingStatus } from '../../generated/client';
import { DomainEvents } from './domain-events';
import { enqueueJob, QueueName } from '../../app/lib/bullmq';

export class OutboxProcessor {
  private isRunning = false;
  private isProcessing = false;
  private currentInterval = 2000;
  private MIN_INTERVAL = 2000;
  private MAX_INTERVAL = 300000; // 5 minutes heartbeat
  private BACKOFF_STEP = 5000;
  private wakeUpResolver?: (value: unknown) => void;

  private lastRescueTime = 0;
  private lastCleanupTime = 0;
  private RESCUE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

  /**
   * Starts the outbox processor polling mechanism.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[OutboxProcessor] Started with adaptive polling (Heartbeat: ${this.MAX_INTERVAL / 1000}s)`);
    this.runLoop();
  }

  stop() {
    this.isRunning = false;
    this.trigger(); // Wake up to exit loop
    console.log(`[OutboxProcessor] Stopped`);
  }

  /**
   * Immediately wake up the processor to check for events.
   * Call this after saving a new event to the outbox.
   */
  trigger() {
    if (this.wakeUpResolver) {
      this.wakeUpResolver(true);
      this.wakeUpResolver = undefined;
    }
    // Reset interval to catch potential rapid successive events
    this.currentInterval = this.MIN_INTERVAL;
  }

  private async runLoop() {
    console.log(`[OutboxProcessor] Starting loop...`);
    
    // Graceful shutdown support
    const shutdown = () => this.stop();
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    while (this.isRunning) {
      try {
        const now = Date.now();

        // 0. Maintenance tasks (only run periodically)
        if (now - this.lastRescueTime > this.RESCUE_INTERVAL) {
          await this.rescueStuckEvents();
          this.lastRescueTime = now;
        }

        if (now - this.lastCleanupTime > this.CLEANUP_INTERVAL) {
          await this.cleanupProcessedEvents();
          this.lastCleanupTime = now;
        }

        // 1. Process current batch
        const eventsProcessed = await this.processOutboxEvents();
        
        if (eventsProcessed > 0) {
          this.currentInterval = this.MIN_INTERVAL;
        } else {
          // No events found, back off towards heartbeat interval
          this.currentInterval = Math.min(this.currentInterval + this.BACKOFF_STEP, this.MAX_INTERVAL);
        }
      } catch (error) {
        console.error('[OutboxProcessor] Loop error:', error);
        this.currentInterval = this.MAX_INTERVAL; // Back off on error
      }

      // Wait for the interval OR until trigger() is called
      await new Promise(resolve => {
        this.wakeUpResolver = resolve;
        setTimeout(() => {
          if (this.wakeUpResolver === resolve) {
            this.wakeUpResolver = undefined;
            resolve(false);
          }
        }, this.currentInterval);
      });
    }
    console.log(`[OutboxProcessor] Loop finished.`);
  }

  /**
   * Resets events stuck in PROCESSING status due to previous processor crashes.
   */
  private async rescueStuckEvents() {
    try {
      const lockTimeout = 10 * 60 * 1000; // 10 minutes
      const threshold = new Date(Date.now() - lockTimeout);

      const rescued = await prisma.outboxEvent.updateMany({
        where: {
          status: ProcessingStatus.PROCESSING,
          updatedAt: { lt: threshold }
        },
        data: {
          status: ProcessingStatus.PENDING,
          lastError: 'RESCUED: Processing timeout exceeded'
        }
      });

      if (rescued.count > 0) {
        console.warn(`[OutboxProcessor] Rescued ${rescued.count} stuck events.`);
      }
    } catch (error) {
      console.error('[OutboxProcessor] Rescue error:', error);
    }
  }

  /**
   * Deletes old processed events to prevent table bloat.
   */
  private async cleanupProcessedEvents() {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const deleted = await prisma.outboxEvent.deleteMany({
        where: {
          status: ProcessingStatus.PROCESSED,
          processedAt: { lt: oneDayAgo }
        }
      });

      if (deleted.count > 0) {
        console.log(`[OutboxProcessor] Cleaned up ${deleted.count} old processed events.`);
      }
    } catch (error) {
      console.error('[OutboxProcessor] Cleanup error:', error);
    }
  }

  /**
   * Reads unprocessed events and dispatches them.
   * Uses FOR UPDATE SKIP LOCKED to ensure multiple instances don't process the same event.
   */
  async processOutboxEvents(): Promise<number> {
    if (this.isProcessing) return 0;
    this.isProcessing = true;
    const now = new Date();

    try {
      // 1. Atomic "Claim" of events using FOR UPDATE SKIP LOCKED
      const batchSize = 50;
      const events: any[] = await prisma.$queryRaw`
        UPDATE "OutboxEvent"
        SET "status" = 'PROCESSING', "updatedAt" = NOW()
        WHERE "id" IN (
          SELECT "id" 
          FROM "OutboxEvent" 
          WHERE "status" IN ('PENDING', 'FAILED')
            AND ("attempts" < 5)
            AND ("nextAttemptAt" IS NULL OR "nextAttemptAt" <= ${now})
          ORDER BY "createdAt" ASC
          LIMIT ${batchSize}
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *
      `;

      if (!events || events.length === 0) return 0;

      for (const event of events) {
        try {
          // 2. Dispatch to appropriate BullMQ Queues
          await this.dispatchToQueues(event.id, event.eventType, event.payload);

          // 3. Mark as PROCESSED
          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: ProcessingStatus.PROCESSED,
              processedAt: new Date(),
              lastError: null
            },
          });
        } catch (dispatchError) {
          const attempts = event.attempts + 1;
          const backoffMinutes = Math.pow(2, attempts); 
          const nextAttemptAt = new Date(now.getTime() + backoffMinutes * 60000);

          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: ProcessingStatus.FAILED,
              attempts,
              lastError: dispatchError instanceof Error ? dispatchError.message : String(dispatchError),
              nextAttemptAt
            },
          });
        }
      }
      return events.length;
    } catch (error) {
      console.error('[OutboxProcessor] Fetch error:', error);
      return 0;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Routing logic: Maps Domain Events to one or more BullMQ Jobs.
   * Uses deterministic Job IDs (eventID + queue) to prevent duplicate enqueuing.
   */
  private async dispatchToQueues(eventId: string, eventType: string, payload: any) {
    // Deterministic ID generator to ensure BullMQ ignores duplicates if dispatch is retried
    const stableJobId = (queue: string) => `${eventId}:${queue}`;

    switch (eventType) {
      case DomainEvents.ORDER_CREATED:
        await enqueueJob(QueueName.EMAIL, 'order-confirmation-email', payload, { jobId: stableJobId('email') });
        await enqueueJob(QueueName.NOTIFICATIONS, 'order-created-notification', payload, { jobId: stableJobId('notify') });
        await enqueueJob(QueueName.ACCOUNTING, 'create-sales-journal', { ...payload, eventId }, { jobId: stableJobId('accounting') });
        await enqueueJob(QueueName.CUSTOMERS, 'update-customer-stats', payload, { jobId: stableJobId('customer') });
        break;

      case DomainEvents.PAYMENT_COMPLETED:
        await enqueueJob(QueueName.EMAIL, 'payment-receipt-email', payload, { jobId: stableJobId('email') });
        await enqueueJob(QueueName.ACCOUNTING, 'mark-invoice-paid', { ...payload, eventId }, { jobId: stableJobId('accounting') });
        await enqueueJob(QueueName.INVENTORY, 'finalize-stock-deduction', payload, { jobId: stableJobId('inventory') });
        await enqueueJob(QueueName.CUSTOMERS, 'update-loyalty-points', payload, { jobId: stableJobId('customer') });
        break;

      case DomainEvents.PAYMENT_REFUNDED:
        await enqueueJob(QueueName.EMAIL, 'refund-confirmation-email', payload, { jobId: stableJobId('email') });
        await enqueueJob(QueueName.ACCOUNTING, 'process-refund-journal', { ...payload, eventId }, { jobId: stableJobId('accounting') });
        break;

      case DomainEvents.INVENTORY_LOW_STOCK:
        await enqueueJob(QueueName.EMAIL, 'low-stock-alert-admin', payload, { jobId: stableJobId('email') });
        await enqueueJob(QueueName.NOTIFICATIONS, 'low-stock-push', payload, { jobId: stableJobId('notify') });
        break;

      case DomainEvents.PURCHASE_RECEIVED:
        await enqueueJob(QueueName.ACCOUNTING, 'create-purchase-journal', { ...payload, eventId }, { jobId: stableJobId('accounting') });
        await enqueueJob(QueueName.INVENTORY, 'update-stock-on-receipt', payload, { jobId: stableJobId('inventory') });
        break;

      case DomainEvents.PURCHASE_PAID:
        await enqueueJob(QueueName.ACCOUNTING, 'record-purchase-payment', { ...payload, eventId }, { jobId: stableJobId('accounting') });
        break;

      case DomainEvents.WAREHOUSE_TRANSFER_COMPLETED:
        await enqueueJob(QueueName.ACCOUNTING, 'record-warehouse-transfer', { ...payload, eventId }, { jobId: stableJobId('accounting') });
        break;

      case DomainEvents.INVENTORY_RESERVED:
        await enqueueJob(QueueName.INVENTORY, 'auto-release-reservation', payload, {
          delay: 15 * 60 * 1000,
          jobId: stableJobId('release-timer') 
        });
        break;

      case DomainEvents.INVENTORY_RELEASED:
        await enqueueJob(QueueName.NOTIFICATIONS, 'inventory-released-alert', payload, { jobId: stableJobId('notify') });
        break;

      case DomainEvents.INVENTORY_DEDUCTED:
        await enqueueJob(QueueName.ACCOUNTING, 'record-cogs', { ...payload, eventId }, { jobId: stableJobId('accounting') });
        break;

      case DomainEvents.PRODUCT_CREATED:
      case DomainEvents.PRODUCT_UPDATED:
        // When a product is created or updated, we need to:
        // 1. Generate/Update AI Embeddings (for vector search)
        // 2. Update Search Index (for keyword search)
        await enqueueJob(QueueName.AI, 'generate-product-embedding', payload, { jobId: stableJobId('ai') });
        await enqueueJob(QueueName.SEARCH, 'sync-product-index', payload, { jobId: stableJobId('search') });
        break;

      case DomainEvents.CUSTOMER_REGISTERED:
        await enqueueJob(QueueName.EMAIL, 'welcome-email', payload, { jobId: stableJobId('email') });
        await enqueueJob(QueueName.NOTIFICATIONS, 'customer-onboarding', payload, { jobId: stableJobId('notify') });
        break;

      case DomainEvents.ORDER_CANCELLED:
        await enqueueJob(QueueName.EMAIL, 'order-cancellation-email', payload, { jobId: stableJobId('email') });
        await enqueueJob(QueueName.NOTIFICATIONS, 'order-cancelled-notification', payload, { jobId: stableJobId('notify') });
        // Accounting might need to reverse things if not handled in the service
        break;

      default:
        // For unhandled events, we might still want a generic handler or just log it
        console.warn(`[OutboxProcessor] No queue mapping for event type: ${eventType}`);
        break;
    }
  }
}

export const outboxProcessor = new OutboxProcessor();

