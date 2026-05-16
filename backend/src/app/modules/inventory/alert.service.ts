import { Item, Inventory } from '../../../generated/client';
import { prisma } from '../../lib/prisma';
import { notificationService } from '../notifications/notification.service';
import { InventoryLowStockPayload } from '../../../shared/events/domain-events';

export class AlertService {
  /**
   * Check for items below threshold for a specific business and send alerts.
   */
  async checkLowStock(businessId: string) {
    // 1. Find all items with total stock below threshold
    const items = await prisma.item.findMany({
      where: { businessId },
      include: {
        inventory: true
      }
    });

    const alertsTriggered: Promise<any>[] = [];

    for (const item of items) {
      const totalStock = item.inventory.reduce((acc: number, inv: Inventory) => acc + inv.availableStock, 0);
      
      if (totalStock <= item.lowStockThreshold) {
        // Trigger alert
        alertsTriggered.push(this.sendLowStockAlert(businessId, item, totalStock));
      }
    }

    await Promise.all(alertsTriggered);
    
    return {
      itemsChecked: items.length,
      alertsSent: alertsTriggered.length
    };
  }

  /**
   * Check low stock for a single item. Used after adjustments.
   */
  async checkItemLowStock(businessId: string, itemId: string) {
    const item = await prisma.item.findFirst({
      where: { id: itemId, businessId },
      include: {
        inventory: true
      }
    });

    if (!item) return;

    const totalStock = item.inventory.reduce((acc: number, inv: Inventory) => acc + inv.availableStock, 0);
    
    if (totalStock <= item.lowStockThreshold) {
      await this.sendLowStockAlert(businessId, item, totalStock);
    }
  }

  private async sendLowStockAlert(businessId: string, item: Item, currentStock: number) {
    // 1. Get recipients (Admins and Managers of the business)
    const staff = await prisma.user.findMany({
      where: {
        businessId,
        role: { in: ['ADMIN', 'MANAGER'] }
      },
      select: {
        id: true,
        email: true
      }
    });

    const userIds = staff.map((u: { id: string }) => u.id);
    const emails = staff.map((u: { email: string | null }) => u.email).filter(Boolean) as string[];

    const payload: InventoryLowStockPayload = {
      businessId,
      itemId: item.id,
      itemName: item.title,
      currentStock,
      threshold: item.lowStockThreshold,
      warehouseId: 'ALL' // aggregated
    };

    return await notificationService.deliver(
      'LOW_STOCK_ALERT',
      payload,
      { userIds, emails },
      businessId
    );
  }
}

