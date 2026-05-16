import { Job } from 'bullmq';
import { createWorker } from './base.worker';
import { QueueName } from '../app/lib/bullmq';

/**
 * Report Worker
 * Handles heavy PDF generation, data exports, and complex report compilation.
 */
createWorker(QueueName.REPORTS, async (job: Job) => {
  const { name, data } = job;

  console.log(`[ReportWorker] Processing: ${name}`);

  switch (name) {
    case 'generate-p-and-l-report':
      console.log(`  -> Compiling Profit & Loss for Business: ${data.businessId}`);
      // Complex aggregation logic here
      break;

    case 'export-customer-list':
      console.log(`  -> Exporting customers for Business: ${data.businessId}`);
      break;

    default:
      console.warn(`[ReportWorker] Unhandled job name: ${name}`);
  }
});
