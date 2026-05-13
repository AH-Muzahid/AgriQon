/**
 * Notification Templates
 * ──────────────────────────────────────────────────────────────────────────
 * This is the ONLY place rendering logic lives in the notification layer.
 * Each function takes a typed payload and returns a ready-to-send message.
 *
 * Rules enforced here:
 *  - No business logic — only "how does this event look to the customer?"
 *  - No DB calls — templates are pure functions (payload → string)
 *  - No conditionals about *whether* to send — callers decide that
 */

import {
  OrderCreatedPayload,
  OrderCancelledPayload,
  PaymentCompletedPayload,
  PaymentFailedPayload,
  InvoiceOverduePayload,
  InventoryLowStockPayload,
  CustomerRegisteredPayload,
  LoyaltyPointsEarnedPayload,
} from '../../../shared/events/domain-events';

// ─── Customer-Facing Templates ─────────────────────────────────────────────

export const Templates = {
  ORDER_CREATED: (p: OrderCreatedPayload) => ({
    subject: `Order Confirmed — #${p.orderId.slice(-8).toUpperCase()}`,
    body: `Hi ${p.customerName ?? 'there'},\n\nYour order (#${p.orderId.slice(-8).toUpperCase()}) for ${p.itemCount} item(s) has been confirmed.\nTotal: ${p.currency ?? 'BDT'} ${p.total.toFixed(2)}\n\nThank you for shopping with us!`,
  }),

  ORDER_CANCELLED: (p: OrderCancelledPayload) => ({
    subject: `Order Cancelled — #${p.orderId.slice(-8).toUpperCase()}`,
    body: `Your order (#${p.orderId.slice(-8).toUpperCase()}) has been cancelled.${
      p.reason ? `\nReason: ${p.reason}` : ''
    }\n\nIf this was unexpected, please contact support.`,
  }),

  PAYMENT_COMPLETED: (p: PaymentCompletedPayload) => ({
    subject: `Payment Received — ${p.currency} ${p.amount.toFixed(2)}`,
    body: `Hi ${p.customerName ?? 'there'},\n\nWe've received your payment of ${p.currency} ${p.amount.toFixed(2)} via ${p.method}.\nTransaction ID: ${p.transactionId ?? 'N/A'}\n\nThank you!`,
  }),

  PAYMENT_FAILED: (p: PaymentFailedPayload) => ({
    subject: `Payment Failed — Action Required`,
    body: `Your payment of ${p.amount.toFixed(2)} for order #${p.orderId.slice(-8).toUpperCase()} could not be processed.${
      p.reason ? `\nReason: ${p.reason}` : ''
    }\n\nPlease retry or contact support.`,
  }),

  INVOICE_OVERDUE: (p: InvoiceOverduePayload) => ({
    subject: `Invoice Overdue — ${p.invoiceNumber}`,
    body: `Invoice ${p.invoiceNumber} is overdue.\nAmount due: ${p.dueAmount.toFixed(2)}\nDue date was: ${p.dueDate}\n\nPlease settle at your earliest convenience.`,
  }),

  CUSTOMER_REGISTERED: (p: CustomerRegisteredPayload) => ({
    subject: `Welcome to AgriQon, ${p.name}!`,
    body: `Hi ${p.name},\n\nYour account has been created successfully.\nEmail: ${p.email}\n\nStart exploring the marketplace today!`,
  }),

  LOYALTY_POINTS_EARNED: (p: LoyaltyPointsEarnedPayload) => ({
    subject: `You earned ${p.pointsEarned} loyalty points!`,
    body: `Great news! You earned ${p.pointsEarned} points on your recent order.\nYour total balance is now ${p.totalPoints} points.\n\nKeep shopping to earn more rewards!`,
  }),

  // ─── Internal / Staff-Facing Templates ──────────────────────────────────
  LOW_STOCK_ALERT: (p: InventoryLowStockPayload) => ({
    subject: `⚠️ Low Stock Alert — ${p.itemName}`,
    body: `Stock for "${p.itemName}" in warehouse ${p.warehouseId} has dropped to ${p.currentStock} units (threshold: ${p.threshold}).\n\nPlease reorder soon.`,
  }),
};
