import { QueueName } from '../app/lib/bullmq';
import { createWorker } from './base.worker';
import { AccountingService } from '../app/modules/accounting/accounting.service';

const accountingService = new AccountingService();

/**
 * Accounting Worker
 * Handles background accounting tasks like creating journal entries,
 * updating invoice statuses, and processing COGS.
 */
export const accountingWorker = createWorker(QueueName.ACCOUNTING, async (job) => {
  const { name, data } = job;
  const { eventId, ...payload } = data;
  
  console.log(`[AccountingWorker] Processing job for event ${eventId} (${name})`);

  switch (name) {
    case 'create-sales-journal':
      await accountingService.handleOrderCreated(payload, eventId);
      break;
      
    case 'mark-invoice-paid':
      await accountingService.handlePaymentCompleted(payload, eventId);
      break;
      
    case 'create-purchase-journal':
      await accountingService.handlePurchaseReceived(payload, eventId);
      break;
      
    case 'record-purchase-payment':
      await accountingService.handlePurchasePaid(payload, eventId);
      break;
      
    case 'process-refund-journal':
      await accountingService.handlePaymentRefunded(payload, eventId);
      break;
      
    case 'record-warehouse-transfer':
      await accountingService.handleWarehouseTransferCompleted(payload, eventId);
      break;
      
    case 'record-cogs':
      await accountingService.handleInventoryDeducted(payload, eventId);
      break;
      
    default:
      console.warn(`[AccountingWorker] Unknown job name: ${name}`);
      break;
  }
});
