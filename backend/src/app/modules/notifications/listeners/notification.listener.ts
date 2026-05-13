import { eventBus } from '../../../../shared/events/event-bus';
import { 
  DomainEvents, 
  OrderCreatedPayload, 
  OrderCancelledPayload, 
  PaymentCompletedPayload, 
  PaymentFailedPayload, 
  InvoiceOverduePayload, 
  InventoryLowStockPayload, 
  CustomerRegisteredPayload, 
  LoyaltyPointsEarnedPayload 
} from '../../../../shared/events/domain-events';
import { notificationService, NotificationRecipients } from '../notification.service';
import { logger } from '../../../lib/logger';
import { prisma } from '../../../lib/prisma';

/**
 * Helper to resolve staff recipients for a business
 */
const resolveStaffRecipients = async (businessId: string): Promise<NotificationRecipients> => {
  const staff = await prisma.user.findMany({
    where: {
      businessId,
      role: { in: ['ADMIN', 'MANAGER', 'WAREHOUSE_KEEPER'] }
    },
    select: { id: true, email: true }
  });

  return {
    userIds: staff.map((s: any) => s.id),
    emails: staff.map((s: any) => s.email)
  };
};

export const registerNotificationListeners = () => {
  logger.info('[NotificationModule] Registering domain event listeners...');

  // ─── Order Events ────────────────────────────────────────────────────────
  eventBus.on(DomainEvents.ORDER_CREATED, async (payload: OrderCreatedPayload) => {
    try {
      const recipients: NotificationRecipients = {
        userIds: payload.customerId ? [payload.customerId] : [],
        emails: payload.customerEmail ? [payload.customerEmail] : []
      };

      await notificationService.deliver('ORDER_CREATED', payload, recipients, payload.businessId);
    } catch (err: any) {
      logger.error('Failed to handle ORDER_CREATED notification', { error: err.message });
    }
  });

  eventBus.on(DomainEvents.ORDER_CANCELLED, async (payload: OrderCancelledPayload) => {
    try {
      const recipients: NotificationRecipients = {
        userIds: payload.customerId ? [payload.customerId] : [],
        emails: payload.customerEmail ? [payload.customerEmail] : []
      };

      await notificationService.deliver('ORDER_CANCELLED', payload, recipients, payload.businessId);
    } catch (err: any) {
      logger.error('Failed to handle ORDER_CANCELLED notification', { error: err.message });
    }
  });

  // ─── Payment Events ──────────────────────────────────────────────────────
  eventBus.on(DomainEvents.PAYMENT_COMPLETED, async (payload: PaymentCompletedPayload) => {
    try {
      const recipients: NotificationRecipients = {
        userIds: payload.customerId ? [payload.customerId] : [],
        emails: payload.customerEmail ? [payload.customerEmail] : []
      };

      await notificationService.deliver('PAYMENT_COMPLETED', payload, recipients, payload.businessId);
    } catch (err: any) {
      logger.error('Failed to handle PAYMENT_COMPLETED notification', { error: err.message });
    }
  });

  eventBus.on(DomainEvents.PAYMENT_FAILED, async (payload: PaymentFailedPayload) => {
    try {
      const recipients: NotificationRecipients = {
        userIds: payload.customerId ? [payload.customerId] : [],
        emails: payload.customerEmail ? [payload.customerEmail] : []
      };

      await notificationService.deliver('PAYMENT_FAILED', payload, recipients, payload.businessId);
    } catch (err: any) {
      logger.error('Failed to handle PAYMENT_FAILED notification', { error: err.message });
    }
  });

  // ─── Invoice Events ──────────────────────────────────────────────────────
  eventBus.on(DomainEvents.INVOICE_OVERDUE, async (payload: InvoiceOverduePayload) => {
    try {
      const recipients: NotificationRecipients = {
        userIds: payload.customerId ? [payload.customerId] : [],
        emails: payload.customerEmail ? [payload.customerEmail] : []
      };

      await notificationService.deliver('INVOICE_OVERDUE', payload, recipients, payload.businessId);
    } catch (err: any) {
      logger.error('Failed to handle INVOICE_OVERDUE notification', { error: err.message });
    }
  });

  // ─── Inventory Events ────────────────────────────────────────────────────
  eventBus.on(DomainEvents.INVENTORY_LOW_STOCK, async (payload: InventoryLowStockPayload) => {
    try {
      // Resolve staff to notify
      const recipients = await resolveStaffRecipients(payload.businessId);
      
      await notificationService.deliver('LOW_STOCK_ALERT', payload, recipients, payload.businessId);
    } catch (err: any) {
      logger.error('Failed to handle INVENTORY_LOW_STOCK notification', { error: err.message });
    }
  });

  // ─── Customer Events ─────────────────────────────────────────────────────
  eventBus.on(DomainEvents.CUSTOMER_REGISTERED, async (payload: CustomerRegisteredPayload) => {
    try {
      const recipients: NotificationRecipients = {
        userIds: [payload.customerId],
        emails: [payload.email]
      };

      await notificationService.deliver('CUSTOMER_REGISTERED', payload, recipients, payload.businessId);
    } catch (err: any) {
      logger.error('Failed to handle CUSTOMER_REGISTERED notification', { error: err.message });
    }
  });

  // ─── Loyalty Events ──────────────────────────────────────────────────────
  eventBus.on(DomainEvents.LOYALTY_POINTS_EARNED, async (payload: LoyaltyPointsEarnedPayload) => {
    try {
      const recipients: NotificationRecipients = {
        userIds: [payload.customerId],
        emails: payload.customerEmail ? [payload.customerEmail] : []
      };

      await notificationService.deliver('LOYALTY_POINTS_EARNED', payload, recipients, payload.businessId);
    } catch (err: any) {
      logger.error('Failed to handle LOYALTY_POINTS_EARNED notification', { error: err.message });
    }
  });

  logger.info('[NotificationModule] All listeners registered.');
};

