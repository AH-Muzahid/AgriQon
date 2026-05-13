/**
 * Accounting Listeners
 * ──────────────────────────────────────────────────────────────────────────
 * Subscribes to the Global Event Bus and triggers the AccountingService.
 * Ensures that financial transactions are automatically recorded in the ledger.
 */

import { eventBus } from '../../../../shared/events/event-bus';
import { 
  DomainEvents, 
  OrderCreatedPayload, 
  PaymentCompletedPayload 
} from '../../../../shared/events/domain-events';
import { AccountingService } from '../accounting.service';
import { logger } from '../../../lib/logger';

const accountingService = new AccountingService();

export const registerAccountingListeners = () => {
  logger.info('[AccountingModule] Registering domain event listeners...');

  // ─── Order Created ───────────────────────────────────────────────────────
  eventBus.on(DomainEvents.ORDER_CREATED, (payload: OrderCreatedPayload) => {
    accountingService.handleOrderCreated(payload).catch(err => 
      logger.error('Failed to record ledger for ORDER_CREATED', { error: err.message, orderId: payload.orderId })
    );
  });

  // ─── Payment Completed ───────────────────────────────────────────────────
  eventBus.on(DomainEvents.PAYMENT_COMPLETED, (payload: PaymentCompletedPayload) => {
    accountingService.handlePaymentCompleted(payload).catch(err => 
      logger.error('Failed to record ledger for PAYMENT_COMPLETED', { error: err.message, orderId: payload.orderId })
    );
  });

  logger.info('[AccountingModule] All listeners registered.');
};
