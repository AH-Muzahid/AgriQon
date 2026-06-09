import { Queue } from 'bullmq';
import { QueueName } from '../app/lib/bullmq';
import { createWorker } from './base.worker';
import { SubscriptionLifecycleService } from '../app/modules/subscriptions/subscription-lifecycle.service';
import { logger } from '../app/lib/logger';

const lifecycleService = new SubscriptionLifecycleService();

export const subscriptionLifecycleWorker = createWorker(QueueName.SUBSCRIPTION, async (job) => {
  logger.info(`[SubscriptionLifecycleWorker] Processing job ${job.id} (${job.name})`);

  if (job.name === 'daily-subscription-lifecycle') {
    await lifecycleService.processExpiredSubscriptions();
  } else {
    logger.warn(`[SubscriptionLifecycleWorker] Unknown job name: ${job.name}`);
  }
});

export const setupSubscriptionLifecycleSchedules = async (subscriptionQueue: Queue) => {
  logger.info('[SubscriptionLifecycle] Setting up daily subscription lifecycle schedule...');

  await subscriptionQueue.add('daily-subscription-lifecycle', {}, {
    repeat: { pattern: '0 0 * * *' }, // Runs daily at midnight
    removeOnComplete: true,
  });

  logger.info('[SubscriptionLifecycle] Daily subscription lifecycle schedule configured.');
};
