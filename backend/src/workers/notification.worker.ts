import { Job } from 'bullmq';
import { createWorker } from './base.worker';
import { QueueName } from '../app/lib/bullmq';

/**
 * Notification Worker
 * Handles real-time push notifications, in-app alerts, etc.
 */
createWorker(QueueName.NOTIFICATIONS, async (job: Job) => {
  const { name, data } = job;

  console.log(`[NotificationWorker] Processing: ${name}`);

  switch (name) {
    case 'order-created-notification':
      // Logic for sending in-app or push notification
      console.log(`  -> Sending notification for Order: ${data.orderId}`);
      break;

    case 'low-stock-push':
      console.log(`  -> Sending low stock alert for Item: ${data.itemName}`);
      break;

    default:
      console.warn(`[NotificationWorker] Unhandled job name: ${name}`);
  }
});
