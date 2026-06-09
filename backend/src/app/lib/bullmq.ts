import { Queue, JobsOptions } from 'bullmq';
import { redis } from './redis';

// Define Queue Names
export enum QueueName {
  EMAIL = 'email-queue',
  NOTIFICATIONS = 'notifications-queue',
  REPORTS = 'reports-queue',
  ACCOUNTING = 'accounting-queue',
  INVENTORY = 'inventory-queue',
  CUSTOMERS = 'customers-queue',
  RECONCILIATION = 'reconciliation-queue',
  AI = 'ai-queue',
  SEARCH = 'search-queue',
  SUBSCRIPTION = 'subscription-queue',
}

// Default Job Options
const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};

// Initialize Queues
export const emailQueue = new Queue(QueueName.EMAIL, { connection: redis, defaultJobOptions });
export const notificationQueue = new Queue(QueueName.NOTIFICATIONS, { connection: redis, defaultJobOptions });
export const reportQueue = new Queue(QueueName.REPORTS, { connection: redis, defaultJobOptions });
export const accountingQueue = new Queue(QueueName.ACCOUNTING, { connection: redis, defaultJobOptions });
export const inventoryQueue = new Queue(QueueName.INVENTORY, { connection: redis, defaultJobOptions });
export const customerQueue = new Queue(QueueName.CUSTOMERS, { connection: redis, defaultJobOptions });
export const reconciliationQueue = new Queue(QueueName.RECONCILIATION, { connection: redis, defaultJobOptions });
export const aiQueue = new Queue(QueueName.AI, { connection: redis, defaultJobOptions });
export const searchQueue = new Queue(QueueName.SEARCH, { connection: redis, defaultJobOptions });
export const subscriptionQueue = new Queue(QueueName.SUBSCRIPTION, { connection: redis, defaultJobOptions });

// Centralized Dispatcher (To be used ONLY by OutboxProcessor)
export const enqueueJob = async (queueName: QueueName, jobName: string, data: any, options?: JobsOptions) => {
  const queueMap: Record<QueueName, Queue> = {
    [QueueName.EMAIL]: emailQueue,
    [QueueName.NOTIFICATIONS]: notificationQueue,
    [QueueName.REPORTS]: reportQueue,
    [QueueName.ACCOUNTING]: accountingQueue,
    [QueueName.INVENTORY]: inventoryQueue,
    [QueueName.CUSTOMERS]: customerQueue,
    [QueueName.RECONCILIATION]: reconciliationQueue,
    [QueueName.AI]: aiQueue,
    [QueueName.SEARCH]: searchQueue,
    [QueueName.SUBSCRIPTION]: subscriptionQueue,
  };

  const queue = queueMap[queueName];
  if (!queue) throw new Error(`Queue ${queueName} not found`);

  return await queue.add(jobName, data, options);
};
