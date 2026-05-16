import { registerInvoiceListeners } from '../../app/modules/invoices/listeners/payment-completed.listener';
import { registerInventoryListeners } from '../../app/modules/inventory/listeners/payment-completed.listener';
import { registerNotificationListeners } from '../../app/modules/notifications/listeners/notification.listener';
import { outboxProcessor } from './outbox.processor';
// Import other listeners here as they are created

export const bootstrapEventListeners = () => {
  console.log('[EventBus] Bootstrapping domain event listeners...');
  
  registerInvoiceListeners();
  registerInventoryListeners();
  registerNotificationListeners();

  console.log('[EventBus] Event listeners registered successfully.');

  // Start the outbox processor to poll the database for outgoing domain events
  outboxProcessor.start();
};
