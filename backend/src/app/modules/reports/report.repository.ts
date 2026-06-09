import { prisma } from '../../lib/prisma';
import { OrderStatus, PurchaseStatus, PaymentStatus } from '../../../generated/client';

export class ReportRepository {
  /**
   * Fetch orders for sales report
   */
  async getSalesOrders(businessId: string, startDate: Date, endDate: Date) {
    return await prisma.order.findMany({
      where: {
        businessId,
        deletedAt: null,
        status: {
          not: OrderStatus.CANCELLED
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            item: true
          }
        },
        customer: true
      }
    });
  }

  /**
   * Fetch inventory items for stock report
   */
  async getInventoryItems(businessId: string) {
    return await prisma.item.findMany({
      where: {
        businessId,
        deletedAt: null
      },
      include: {
        inventory: {
          include: {
            warehouse: true
          }
        },
        category: true
      }
    });
  }

  /**
   * Fetch payments (revenue) in period
   */
  async getPaymentsInPeriod(businessId: string, startDate: Date, endDate: Date) {
    return await prisma.payment.findMany({
      where: {
        businessId,
        status: PaymentStatus.COMPLETED,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  /**
   * Fetch purchases (expenses) in period
   */
  async getPurchasesInPeriod(businessId: string, startDate: Date, endDate: Date) {
    return await prisma.purchaseOrder.findMany({
      where: {
        businessId,
        status: {
          not: PurchaseStatus.CANCELLED
        },
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }
}
