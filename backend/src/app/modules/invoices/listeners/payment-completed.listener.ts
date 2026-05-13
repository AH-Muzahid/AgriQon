import { eventBus, EventName } from '../../../../shared/events/event-bus';
import { PaymentCompletedPayload } from '../../payments/events/payment.events';
import { InvoiceService } from '../invoice.service';
import { prisma } from '../../../lib/prisma';

export const registerInvoiceListeners = () => {
  eventBus.on(EventName.PAYMENT_COMPLETED, async (payload: PaymentCompletedPayload) => {
    try {
      console.log(`[InvoiceListener] Processing payment completed for order: ${payload.orderId}`);
      
      // Since we don't have dependency injection framework, we instantiate or use prisma directly
      // Ideally, the event payload gives us orderId, so we can find the invoice linked to it.
      
      const invoice = await prisma.invoice.findUnique({
        where: { orderId: payload.orderId }
      });

      if (!invoice) {
        console.warn(`[InvoiceListener] No invoice found for orderId: ${payload.orderId}`);
        return;
      }

      // We need to update paid amount.
      // Make sure we handle concurrent updates carefully if partial payments are allowed.
      // For now, let's assume atomic update of paidAmount
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: {
            increment: payload.amount
          },
          dueAmount: {
            decrement: payload.amount
          }
        }
      });

      console.log(`[InvoiceListener] Successfully updated invoice ${invoice.invoiceNumber}. New due: ${updatedInvoice.dueAmount}`);
    } catch (error) {
      console.error(`[InvoiceListener] Failed to process payment completed event:`, error);
    }
  });
};
