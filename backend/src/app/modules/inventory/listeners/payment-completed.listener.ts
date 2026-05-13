import { eventBus, EventName } from '../../../../shared/events/event-bus';
import { PaymentCompletedPayload } from '../../payments/events/payment.events';
import { prisma } from '../../../lib/prisma';

export const registerInventoryListeners = () => {
  eventBus.on(EventName.PAYMENT_COMPLETED, async (payload: PaymentCompletedPayload) => {
    try {
      console.log(`[InventoryListener] Processing payment completed for order: ${payload.orderId}`);
      
      // Find reservations for this order
      const reservations = await prisma.stockReservation.findMany({
        where: { orderId: payload.orderId }
      });

      if (reservations.length === 0) {
        console.log(`[InventoryListener] No stock reservations found for orderId: ${payload.orderId}`);
        return;
      }

      // Start a transaction to deduct actual stock and remove reservations
      await prisma.$transaction(async (tx: any) => {
        for (const reservation of reservations) {
          // Deduct from reservedStock and totalStock, availableStock was already deducted during reservation
          await tx.inventory.update({
            where: { id: reservation.inventoryId },
            data: {
              reservedStock: { decrement: reservation.quantity },
              totalStock: { decrement: reservation.quantity }
            }
          });

          // Log the stock movement
          await tx.stockMovement.create({
            data: {
              businessId: payload.businessId,
              inventoryId: reservation.inventoryId,
              type: 'OUT',
              quantity: reservation.quantity,
              reference: `ORDER_${payload.orderId}`,
              reason: 'Order fulfillment upon payment'
            }
          });

          // Delete the reservation
          await tx.stockReservation.delete({
            where: { id: reservation.id }
          });
        }
      });

      console.log(`[InventoryListener] Successfully committed stock for order ${payload.orderId}`);
    } catch (error) {
      console.error(`[InventoryListener] Failed to process payment completed event:`, error);
    }
  });
};
