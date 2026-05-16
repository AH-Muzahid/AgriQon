import { Job } from 'bullmq';
import { createWorker } from './base.worker';
import { QueueName } from '../app/lib/bullmq';
import { InventoryRepository } from '../app/modules/inventory/inventory.repository';
import { InventoryService } from '../app/modules/inventory/inventory.service';

/**
 * Handles inventory related background jobs
 */
export const inventoryWorker = createWorker(QueueName.INVENTORY, async (job: Job) => {
  const { eventId, ...payload } = job.data;

  switch (job.name) {
    case 'auto-release-reservation':
      await handleAutoReleaseReservation(payload);
      break;

    // Add other inventory-related job handlers here
    
    default:
      console.warn(`[InventoryWorker] Unknown job name: ${job.name}`);
  }
});

/**
 * Automatically releases an inventory reservation after a timeout
 * Rule 10: Reservation Expiry
 */
async function handleAutoReleaseReservation(payload: any) {
  const { orderId, businessId } = payload;
  
  const inventoryRepo = new InventoryRepository();
  const inventoryService = new InventoryService(inventoryRepo);

  console.log(`[InventoryWorker] Checking expiry for order reservations: ${orderId}`);

  try {
    await inventoryService.releaseOrderReservations(orderId, businessId);
    console.log(`[InventoryWorker] Successfully processed order reservation release for: ${orderId}`);
  } catch (error: any) {
    console.error(`[InventoryWorker] Order reservation release failed for ${orderId}: ${error.message}`);
    throw error; // Re-throw to trigger BullMQ retry
  }
}
