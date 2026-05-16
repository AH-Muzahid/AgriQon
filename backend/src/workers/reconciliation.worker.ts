import { Worker, Job, Queue } from 'bullmq';
import { redis } from '../app/lib/redis';
import { ReconciliationService } from '../app/modules/reconciliation/reconciliation.service';
import { logger } from '../app/lib/logger';
import { prisma } from '../app/lib/prisma';

const reconciliationService = new ReconciliationService();

/**
 * BullMQ Worker for Reconciliation tasks.
 * Handles both scheduled integrity audits and manual reconciliation requests.
 */
export const reconciliationWorker = new Worker(
  'reconciliation-queue',
  async (job: Job) => {
    logger.info(`[ReconciliationWorker] Processing job ${job.id} (${job.name})`);

    try {
      switch (job.name) {
        case 'daily-full-audit':
          const auditResults = await reconciliationService.runGlobalReconciliation();
          await processAuditResults(auditResults, 'FULL_AUDIT');
          break;

        case 'daily-outbox-cleanup':
          const { deleted } = await reconciliationService.cleanupOldOutboxEvents(30);
          logger.info(`[ReconciliationWorker] Outbox cleanup completed. Deleted ${deleted} events.`);
          break;

        case 'critical-health-check':
          const healthResults = await reconciliationService.runGlobalCriticalChecks();
          await processAuditResults(healthResults, 'CRITICAL_CHECK');
          break;

        default:
          logger.warn(`[ReconciliationWorker] Unknown job name: ${job.name}`);
      }
    } catch (error: any) {
      logger.error(`[ReconciliationWorker] Error processing job ${job.id}: ${error.message}`);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 1, // Keep it serial to avoid heavy load
  }
);

/**
 * Process audit results and create notifications for failures
 */
async function processAuditResults(results: any[], type: string) {
  for (const businessResult of results) {
    const failures = businessResult.results.filter((r: any) => r.status === 'FAIL');
    const warnings = businessResult.results.filter((r: any) => r.status === 'WARNING');

    if (failures.length > 0 || (type === 'FULL_AUDIT' && warnings.length > 0)) {
      logger.warn(`[ReconciliationWorker][${type}] Issues detected for business ${businessResult.businessId}`, { failures, warnings });
      
      const issues = [...failures, ...warnings];
      const summary = issues.map(f => `[${f.status}] ${f.checkName}: ${f.message}`).join('\n');
      
      await prisma.notification.create({
        data: {
          businessId: businessResult.businessId,
          title: `Data Integrity Alert (${type})`,
          message: `System detected data drift or integrity issues:\n${summary}`,
          type: 'SYSTEM_ALERT',
        }
      });
    }
  }
}

/**
 * Helper to setup repeatable jobs for the reconciliation queue
 */
export const setupReconciliationSchedules = async (reconciliationQueue: Queue) => {
  logger.info('[Reconciliation] Setting up repeatable job schedules...');

  // 1. Full Audit: Daily at 1:00 AM
  await reconciliationQueue.add('daily-full-audit', {}, {
    repeat: { pattern: '0 1 * * *' },
    removeOnComplete: true,
  });

  // 2. Outbox Cleanup: Daily at 2:00 AM
  await reconciliationQueue.add('daily-outbox-cleanup', {}, {
    repeat: { pattern: '0 2 * * *' },
    removeOnComplete: true,
  });

  // 3. Critical Health Check: Every 15 minutes
  await reconciliationQueue.add('critical-health-check', {}, {
    repeat: { pattern: '*/15 * * * *' },
    removeOnComplete: true,
  });

  logger.info('[Reconciliation] Repeatable jobs configured.');
};

reconciliationWorker.on('completed', (job) => {
  logger.info(`[ReconciliationWorker] Job ${job.id} completed.`);
});

reconciliationWorker.on('failed', (job, err) => {
  logger.error(`[ReconciliationWorker] Job ${job?.id} failed: ${err.message}`);
});
