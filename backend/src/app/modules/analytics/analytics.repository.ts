import { prisma } from '../../lib/prisma';
import { PaymentStatus, PurchaseStatus } from '../../../generated/client';

export class AnalyticsRepository {
  /**
   * Aggregate net revenue (payments - refunds)
   */
  async getNetRevenue(businessId: string): Promise<number> {
    const paymentSum = await prisma.payment.aggregate({
      where: {
        businessId,
        status: PaymentStatus.COMPLETED,
      },
      _sum: {
        amount: true,
      },
    });

    const refundSum = await prisma.refund.aggregate({
      where: {
        businessId,
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const totalPaid = Number(paymentSum._sum.amount || 0);
    const totalRefunded = Number(refundSum._sum.amount || 0);

    return totalPaid - totalRefunded;
  }

  /**
   * Count active orders
   */
  async getOrdersCount(businessId: string): Promise<number> {
    return await prisma.order.count({
      where: {
        businessId,
        deletedAt: null,
      },
    });
  }

  /**
   * Count active customers
   */
  async getCustomersCount(businessId: string): Promise<number> {
    return await prisma.customer.count({
      where: {
        businessId,
        deletedAt: null,
      },
    });
  }

  /**
   * Calculate total inventory value
   */
  async getInventoryValue(businessId: string): Promise<number> {
    const items = await prisma.item.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      select: {
        costPrice: true,
        inventory: {
          select: {
            availableStock: true,
          },
        },
      },
    });

    let totalValue = 0;
    for (const item of items) {
      const stock = item.inventory.reduce((sum: number, inv: { availableStock: number }) => sum + inv.availableStock, 0);
      const unitCost = Number(item.costPrice || 0);
      totalValue += stock * unitCost;
    }

    return totalValue;
  }

  /**
   * Count items with stock below threshold
   */
  async getLowStockAlertsCount(businessId: string): Promise<number> {
    const items = await prisma.item.findMany({
      where: {
        businessId,
        deletedAt: null,
      },
      select: {
        lowStockThreshold: true,
        inventory: {
          select: {
            availableStock: true,
          },
        },
      },
    });

    let alertCount = 0;
    for (const item of items) {
      const stock = item.inventory.reduce((sum: number, inv: { availableStock: number }) => sum + inv.availableStock, 0);
      if (stock < item.lowStockThreshold) {
        alertCount++;
      }
    }

    return alertCount;
  }

  /**
   * Get payments for trend analysis
   */
  async getPaymentsInPeriod(businessId: string, startDate: Date, endDate: Date) {
    return await prisma.payment.findMany({
      where: {
        businessId,
        status: PaymentStatus.COMPLETED,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Get purchase orders (expenses) for trend analysis
   */
  async getPurchasesInPeriod(businessId: string, startDate: Date, endDate: Date) {
    return await prisma.purchaseOrder.findMany({
      where: {
        businessId,
        status: {
          not: PurchaseStatus.CANCELLED,
        },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
