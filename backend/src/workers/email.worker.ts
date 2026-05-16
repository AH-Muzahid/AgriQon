import { Job } from 'bullmq';
import { QueueName } from '../app/lib/bullmq';
import { createWorker } from './base.worker';

/**
 * Email Worker
 * Handles all email-related background tasks.
 */
export const emailWorker = createWorker(QueueName.EMAIL, async (job: Job) => {
  const { name, data } = job;

  console.log(`[EmailWorker] Processing job: ${name}`);

  switch (name) {
    case 'order-confirmation-email':
      // TODO: Integrate with Postmark/SendGrid
      console.log(`   -> Sending Order Confirmation to: ${data.customerEmail}`);
      break;

    case 'payment-receipt-email':
      console.log(`   -> Sending Payment Receipt for: ${data.paymentId}`);
      break;

    default:
      console.warn(`   -> Unknown email job name: ${name}`);
  }
});
