import { prisma } from '../../app/lib/prisma';
import { eventBus } from './event-bus';

export class OutboxProcessor {
  private isProcessing = false;
  private intervalId?: NodeJS.Timeout;

  /**
   * Starts the outbox processor polling mechanism.
   * @param intervalMs The interval in milliseconds to check for outbox events (default 5000ms)
   */
  start(intervalMs = 5000) {
    if (this.intervalId) {
      return;
    }
    console.log(`[OutboxProcessor] Started with interval ${intervalMs}ms`);
    this.intervalId = setInterval(() => this.processOutboxEvents(), intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      console.log(`[OutboxProcessor] Stopped`);
    }
  }

  /**
   * Reads unprocessed events from the OutboxEvent table and dispatches them to the EventBus.
   * After successful dispatch, marks them as processed.
   */
  async processOutboxEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // Find up to 50 unprocessed events
      const events = await prisma.outboxEvent.findMany({
        where: { isProcessed: false },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      if (events.length === 0) {
        this.isProcessing = false;
        return;
      }

      console.log(`[OutboxProcessor] Found ${events.length} unprocessed events`);

      for (const event of events) {
        try {
          // Dispatch to the central EventBus
          eventBus.emit(event.eventType, event.payload);

          // Mark as processed
          await prisma.outboxEvent.update({
            where: { id: event.id },
            data: { isProcessed: true },
          });
        } catch (dispatchError) {
          console.error(`[OutboxProcessor] Error processing event ${event.id}:`, dispatchError);
          // Depending on requirements, we can implement retry counts, dead-letter queues, etc.
        }
      }
    } catch (error) {
      console.error('[OutboxProcessor] Failed to fetch outbox events:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}

// Export a singleton instance
export const outboxProcessor = new OutboxProcessor();
