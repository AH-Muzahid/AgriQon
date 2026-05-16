import { Worker, Job } from 'bullmq';
import { redis } from '../app/lib/redis';
import { QueueName } from '../app/lib/bullmq';

/**
 * Base Worker setup to handle different queues.
 */
export const createWorker = (
  queueName: QueueName,
  processor: (job: Job) => Promise<void>
) => {
  const worker = new Worker(queueName, processor, {
    connection: redis,
    concurrency: 5, // Process 5 jobs at a time
  });

  worker.on('completed', (job) => {
    console.log(`[Worker:${queueName}] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker:${queueName}] Job ${job?.id} failed:`, err);
  });

  return worker;
};
