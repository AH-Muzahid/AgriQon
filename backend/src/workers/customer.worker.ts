import { Worker, Job } from 'bullmq';
import { redis } from '../app/lib/redis';
import { CustomerService } from '../app/modules/customers/customer.service';
import { logger } from '../app/lib/logger';

const customerService = new CustomerService();

export const customerWorker = new Worker(
  'customers-queue',
  async (job: Job) => {
    const { eventId, ...payload } = job.data;
    
    logger.info(`[CustomerWorker] Processing job ${job.id} (${job.name}) for customer ${payload.customerId || 'unknown'}`);

    try {
      switch (job.name) {
        case 'update-customer-stats':
          await customerService.handleOrderCreated(payload);
          break;
          
        case 'update-loyalty-points':
          await customerService.handlePaymentCompleted(payload);
          break;
          
        default:
          logger.warn(`[CustomerWorker] Unknown job name: ${job.name}`);
      }
    } catch (error: any) {
      logger.error(`[CustomerWorker] Error processing job ${job.id}: ${error.message}`);
      throw error; // Rethrow to allow BullMQ to retry
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

customerWorker.on('completed', (job) => {
  logger.info(`[CustomerWorker] Job ${job.id} completed successfully.`);
});

customerWorker.on('failed', (job, err) => {
  logger.error(`[CustomerWorker] Job ${job?.id} failed: ${err.message}`);
});
