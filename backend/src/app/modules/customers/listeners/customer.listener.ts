/**
 * Customer Listeners
 * ──────────────────────────────────────────────────────────────────────────
 * Subscribes to the Global Event Bus and triggers the CustomerService.
 * Ensures that customer stats and loyalty points are updated automatically.
 */

import { eventBus } from '../../../../shared/events/event-bus';
import { 
  DomainEvents, 
  OrderCreatedPayload, 
  PaymentCompletedPayload 
} from '../../../../shared/events/domain-events';
import { CustomerService } from '../customer.service';
import { logger } from '../../../lib/logger';

const customerService = new CustomerService();

export const registerCustomerListeners = () => {
  logger.info('[CustomerModule] Registering domain event listeners...');

  // ─── Order Created ───────────────────────────────────────────────────────
  eventBus.on(DomainEvents.ORDER_CREATED, (payload: OrderCreatedPayload) => {
    customerService.handleOrderCreated(payload).catch(err => 
      logger.error('Failed to handle ORDER_CREATED in CustomerModule', { error: err.message, orderId: payload.orderId })
    );
  });

  // ─── Payment Completed ───────────────────────────────────────────────────
  eventBus.on(DomainEvents.PAYMENT_COMPLETED, (payload: PaymentCompletedPayload) => {
    customerService.handlePaymentCompleted(payload).catch(err => 
      logger.error('Failed to handle PAYMENT_COMPLETED in CustomerModule', { error: err.message, orderId: payload.orderId })
    );
  });

  logger.info('[CustomerModule] All listeners registered.');
};
