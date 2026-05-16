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
  PaymentCompletedPayload,
  PaymentRefundedPayload,
  InventoryDeductedPayload,
  PurchaseReceivedPayload,
  WarehouseTransferCompletedPayload
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

  // ─── Purchase Received ───────────────────────────────────────────────────
  eventBus.on(DomainEvents.PURCHASE_RECEIVED, (payload: PurchaseReceivedPayload) => {
    accountingService.handlePurchaseReceived(payload).catch(err => 
      logger.error('Failed to record ledger for PURCHASE_RECEIVED', { error: err.message, purchaseId: payload.purchaseId })
    );
  });

  // ─── Purchase Paid ───────────────────────────────────────────────────────
  eventBus.on(DomainEvents.PURCHASE_PAID, (payload: any) => {
    accountingService.handlePurchasePaid(payload).catch(err => 
      logger.error('Failed to record ledger for PURCHASE_PAID', { error: err.message, purchaseId: payload.purchaseId })
    );
  });

  // ─── Payment Refunded ────────────────────────────────────────────────────
  eventBus.on(DomainEvents.PAYMENT_REFUNDED, (payload: PaymentRefundedPayload) => {
    accountingService.handlePaymentRefunded(payload).catch(err => 
      logger.error('Failed to record ledger for PAYMENT_REFUNDED', { error: err.message, orderId: payload.orderId })
    );
  });

  // ─── Inventory Deducted (COGS) ───────────────────────────────────────────
  eventBus.on(DomainEvents.INVENTORY_DEDUCTED, (payload: InventoryDeductedPayload) => {
    accountingService.handleInventoryDeducted(payload).catch(err => 
      logger.error('Failed to record ledger for INVENTORY_DEDUCTED', { error: err.message, orderId: payload.orderId })
    );
  });

  // ─── Warehouse Transfer Completed ─────────────────────────────────────────
  eventBus.on(DomainEvents.WAREHOUSE_TRANSFER_COMPLETED, (payload: WarehouseTransferCompletedPayload) => {
    accountingService.handleWarehouseTransferCompleted(payload).catch(err => 
      logger.error('Failed to record ledger for WAREHOUSE_TRANSFER_COMPLETED', { error: err.message, transferId: payload.transferId })
    );
  });

  logger.info('[AccountingModule] All listeners registered.');
};
