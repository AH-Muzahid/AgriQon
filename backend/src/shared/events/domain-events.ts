/**
 * Domain Event Registry
 * ──────────────────────────────────────────────────────────────────────────
 * Convention: domain.<aggregate>.<past_tense_verb>
 *
 * ALL event names MUST be defined here.
 * Modules MUST import from this file — never use raw strings on eventBus.
 *
 * Separation of concerns:
 *   - Domain layer  → emits these events via OutboxEvent table
 *   - Delivery layer → notifications module subscribes and renders/delivers
 *   - Side-effects  → inventory, invoice, loyalty subscribe to business events
 */

// ─── Order Events ──────────────────────────────────────────────────────────
export const DomainEvents = {
  ORDER_CREATED:           'domain.order.created',
  ORDER_CONFIRMED:         'domain.order.confirmed',
  ORDER_CANCELLED:         'domain.order.cancelled',
  ORDER_STATUS_CHANGED:    'domain.order.status_changed',

  // ─── Payment Events ────────────────────────────────────────────────────
  PAYMENT_COMPLETED:       'domain.payment.completed',
  PAYMENT_FAILED:          'domain.payment.failed',
  PAYMENT_REFUNDED:        'domain.payment.refunded',

  // ─── Invoice Events ────────────────────────────────────────────────────
  INVOICE_CREATED:         'domain.invoice.created',
  INVOICE_PAID:            'domain.invoice.paid',
  INVOICE_OVERDUE:         'domain.invoice.overdue',

  // ─── Inventory Events ──────────────────────────────────────────────────
  INVENTORY_RESERVED:      'domain.inventory.reserved',
  INVENTORY_RELEASED:      'domain.inventory.released',
  INVENTORY_DEDUCTED:      'domain.inventory.deducted',
  INVENTORY_LOW_STOCK:     'domain.inventory.low_stock',

  // ─── Customer Events ───────────────────────────────────────────────────
  CUSTOMER_REGISTERED:     'domain.customer.registered',

  // ─── Loyalty Events ────────────────────────────────────────────────────
  LOYALTY_POINTS_EARNED:   'domain.loyalty.points_earned',
  LOYALTY_POINTS_REDEEMED: 'domain.loyalty.points_redeemed',

  // ─── Purchase (Procurement) Events ─────────────────────────────────────
  PURCHASE_CREATED:        'domain.purchase.created',
  PURCHASE_RECEIVED:       'domain.purchase.received',
  PURCHASE_CANCELLED:      'domain.purchase.cancelled',
  PURCHASE_PAID:           'domain.purchase.paid',

  // ─── Warehouse Events ──────────────────────────────────────────────────
  WAREHOUSE_TRANSFER_COMPLETED: 'domain.warehouse.transfer_completed',

  // ─── Product Events ────────────────────────────────────────────────────
  PRODUCT_CREATED:         'domain.product.created',
  PRODUCT_UPDATED:         'domain.product.updated',
} as const;

export type DomainEventName = typeof DomainEvents[keyof typeof DomainEvents];

// ─── Payload Contracts ─────────────────────────────────────────────────────
// Each event has a typed payload. Consumers rely on these — never `any`.

export interface OrderCreatedPayload {
  orderId: string;
  businessId: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency?: string;
  itemCount: number;
}

export interface OrderCancelledPayload {
  orderId: string;
  businessId: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  reason?: string;
}

export interface OrderStatusChangedPayload {
  orderId: string;
  businessId: string;
  oldStatus: string;
  newStatus: string;
  customerId?: string;
  customerEmail?: string;
}

export interface PaymentCompletedPayload {
  paymentId: string;
  orderId: string;
  businessId: string;
  amount: number;
  currency: string;
  method: string;
  transactionId?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

export interface PaymentFailedPayload {
  paymentId: string;
  orderId: string;
  businessId: string;
  amount: number;
  reason?: string;
  transactionId?: string;
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface PaymentRefundedPayload {
  paymentId: string;
  orderId: string;
  businessId: string;
  amount: number;
  reason?: string;
  transactionId?: string;
}

export interface InvoiceOverduePayload {
  invoiceId: string;
  invoiceNumber: string;
  businessId: string;
  customerId?: string;
  customerEmail?: string;
  dueAmount: number;
  dueDate: string;
}

export interface InventoryLowStockPayload {
  businessId: string;
  itemId: string;
  itemName: string;
  warehouseId: string;
  currentStock: number;
  threshold: number;
}

export interface InventoryReservedPayload {
  reservationId: string;
  businessId: string;
  orderId?: string;
  items: Array<{ itemId: string; quantity: number }>;
}

export interface InventoryReleasedPayload {
  reservationId: string;
  orderId?: string;
  reason?: string;
}

export interface InventoryDeductedPayload {
  businessId: string;
  itemId: string;
  orderId: string;
  quantity: number;
  costPrice: number; // For COGS calculation
}

export interface CustomerRegisteredPayload {
  customerId: string;
  businessId: string;
  email: string;
  name: string;
}

export interface LoyaltyPointsEarnedPayload {
  customerId: string;
  businessId: string;
  orderId: string;
  pointsEarned: number;
  totalPoints: number;
  customerEmail?: string;
}

export interface PurchaseCreatedPayload {
  purchaseId: string;
  businessId: string;
  supplierId: string;
  total: number;
}

export interface PurchaseReceivedPayload {
  purchaseId: string;
  businessId: string;
  supplierId: string;
  total: number;
}

export interface PurchasePaidPayload {
  purchaseId: string;
  businessId: string;
  supplierId: string;
  amount: number;
}

export interface WarehouseTransferCompletedPayload {
  transferId: string;
  businessId: string;
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  totalValue: number;
}

export interface ProductCreatedPayload {
  productId: string;
  businessId: string;
  title: string;
  sku?: string;
  price: number;
}

export interface ProductUpdatedPayload {
  productId: string;
  businessId: string;
  title: string;
  sku?: string;
  price: number;
}

// ─── Event Dispatch Utility ───────────────────────────────────────────────

import { prisma } from '../../app/lib/prisma';
import { outboxProcessor } from './outbox.processor';

/**
 * Persists a Domain Event to the Outbox table.
 * MUST be called within a Prisma transaction to ensure atomicity.
 */
export const emitDomainEvent = async (
  tx: any, // Prisma Transaction Client
  eventType: DomainEventName,
  payload: any,
  businessId: string,
  aggregateType: string,
  aggregateId: string
) => {
  await tx.outboxEvent.create({
    data: {
      eventType,
      payload: payload as any,
      businessId,
      aggregateType,
      aggregateId,
      status: 'PENDING',
    },
  });

  // Signal the processor to wake up and check for new events
  // This is a "best effort" optimization; the poller will catch it regardless.
  setImmediate(() => outboxProcessor.trigger());
};
