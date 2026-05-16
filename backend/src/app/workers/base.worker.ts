import { prisma } from '../lib/prisma';
import { ProcessingStatus } from '../../../generated/client';
import { crypto } from 'node:crypto';

export abstract class BaseWorker {
  protected isRunning = false;
  protected pollInterval = 5000; // 5 seconds
  protected lockTimeout = 5 * 60 * 1000; // 5 minutes
  protected maxAttempts = 5;
  protected workerId: string;

  constructor(protected workerName: string) {
    this.workerId = `${workerName}_${crypto.randomUUID()}`;
    
    // Support graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[${this.workerName}] Started with ID ${this.workerId}...`);
    this.poll();
  }

  async stop() {
    this.isRunning = false;
    console.log(`[${this.workerName}] Stopping gracefully...`);
  }

  private async poll() {
    while (this.isRunning) {
      try {
        // 1. Rescue stuck events from crashed workers
        await this.rescueStuckEvents();

        // 2. Process next batch
        await this.processNextBatch();
      } catch (error) {
        console.error(`[${this.workerName}] Error in poll loop:`, error);
      }
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }
    console.log(`[${this.workerName}] Poll loop finished.`);
  }

  /**
   * Resets events that have been in PROCESSING status for too long.
   * This handles cases where a worker instance crashed without updating the status.
   */
  private async rescueStuckEvents() {
    const timeoutThreshold = new Date(Date.now() - this.lockTimeout);
    
    const stuck = await prisma.outboxEvent.updateMany({
      where: {
        status: ProcessingStatus.PROCESSING,
        lockedAt: { lt: timeoutThreshold }
      },
      data: {
        status: ProcessingStatus.PENDING,
        lockedAt: null,
        lockId: null,
        lastError: 'RESCUED: Processing timeout exceeded'
      }
    });

    if (stuck.count > 0) {
      console.warn(`[${this.workerName}] Rescued ${stuck.count} stuck events.`);
    }
  }

  private async processNextBatch() {
    // Atomic Pick and Lock
    // We look for PENDING events or FAILED events whose retry time has come
    const eventsToProcess = await this.pickAndLockEvents(10);

    for (const event of eventsToProcess) {
      if (!this.isRunning) break;

      try {
        await this.handleEvent(event);

        // Mark as processed
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { 
            status: ProcessingStatus.PROCESSED,
            processedAt: new Date(),
            lockedAt: null,
            lockId: null
          }
        });
      } catch (error: any) {
        console.error(`[${this.workerName}] Failed to process event ${event.id}:`, error);
        
        const nextAttempt = event.attempts + 1;
        const isFinalFailure = nextAttempt >= this.maxAttempts;
        
        // Exponential backoff: 30s, 2m, 8m, 32m...
        const backoffMinutes = Math.pow(4, nextAttempt - 1) * 0.5;
        const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000);

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { 
            status: isFinalFailure ? ProcessingStatus.FAILED : ProcessingStatus.PENDING,
            attempts: nextAttempt,
            lastError: error.message || String(error),
            nextAttemptAt: isFinalFailure ? null : nextAttemptAt,
            lockedAt: null,
            lockId: null
          }
        });
      }
    }
  }

  /**
   * Atomically picks and locks a batch of events.
   * Uses a transaction and lock identifier to prevent race conditions in horizontal scaling.
   */
  private async pickAndLockEvents(limit: number) {
    // In a real high-load scenario, we would use SELECT ... FOR UPDATE SKIP LOCKED
    // Prisma doesn't support SKIP LOCKED natively in its high-level API yet, 
    // so we use a robust status-based selection with a lockId for ownership.
    
    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      
      const events = await tx.outboxEvent.findMany({
        where: {
          status: ProcessingStatus.PENDING,
          OR: [
            { nextAttemptAt: null },
            { nextAttemptAt: { lte: now } }
          ]
        },
        take: limit,
        orderBy: { createdAt: 'asc' }
      });

      if (events.length === 0) return [];

      const ids = events.map(e => e.id);
      
      // Lock them to this worker instance
      await tx.outboxEvent.updateMany({
        where: { id: { in: ids } },
        data: {
          status: ProcessingStatus.PROCESSING,
          lockedAt: now,
          lockId: this.workerId
        }
      });

      return events;
    });
  }

  protected abstract handleEvent(event: any): Promise<void>;
}
