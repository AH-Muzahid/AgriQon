import { AnalyticsRepository } from './analytics.repository';

export class AnalyticsService {
  private analyticsRepository: AnalyticsRepository;

  constructor() {
    this.analyticsRepository = new AnalyticsRepository();
  }

  /**
   * Get high-level dashboard metrics
   */
  async getDashboardSummary(businessId: string) {
    const [
      revenue,
      ordersCount,
      customersCount,
      inventoryValue,
      lowStockAlerts,
    ] = await Promise.all([
      this.analyticsRepository.getNetRevenue(businessId),
      this.analyticsRepository.getOrdersCount(businessId),
      this.analyticsRepository.getCustomersCount(businessId),
      this.analyticsRepository.getInventoryValue(businessId),
      this.analyticsRepository.getLowStockAlertsCount(businessId),
    ]);

    return {
      revenue,
      ordersCount,
      customersCount,
      inventoryValue,
      lowStockAlerts,
    };
  }

  /**
   * Get financial trend grouped by month
   */
  async getFinancialTrend(businessId: string, startDateStr?: string, endDateStr?: string) {
    // Default to last 12 months if dates not specified
    const endDate = endDateStr ? new Date(endDateStr) : new Date();
    const startDate = startDateStr 
      ? new Date(startDateStr) 
      : new Date(endDate.getFullYear() - 1, endDate.getMonth() + 1, 1);

    const [payments, purchases] = await Promise.all([
      this.analyticsRepository.getPaymentsInPeriod(businessId, startDate, endDate),
      this.analyticsRepository.getPurchasesInPeriod(businessId, startDate, endDate),
    ]);

    // Grouping by YYYY-MM
    const monthlyData: Record<string, { month: string; revenue: number; expense: number }> = {};

    // Helper to initialize month
    const initMonth = (monthStr: string) => {
      if (!monthlyData[monthStr]) {
        monthlyData[monthStr] = { month: monthStr, revenue: 0, expense: 0 };
      }
    };

    // Fill months in date range to avoid empty months
    let current = new Date(startDate.getTime());
    while (current <= endDate) {
      const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      initMonth(monthStr);
      current.setMonth(current.getMonth() + 1);
    }
    // Also ensure start/end months are in there
    const endMonthStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;
    initMonth(endMonthStr);

    // Aggregate Payments (Revenue)
    for (const payment of payments) {
      const pDate = new Date(payment.createdAt);
      const monthStr = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
      initMonth(monthStr);
      monthlyData[monthStr].revenue += Number(payment.amount);
    }

    // Aggregate Purchases (Expenses)
    for (const purchase of purchases) {
      const purDate = new Date(purchase.createdAt);
      const monthStr = `${purDate.getFullYear()}-${String(purDate.getMonth() + 1).padStart(2, '0')}`;
      initMonth(monthStr);
      monthlyData[monthStr].expense += Number(purchase.total);
    }

    // Convert to sorted array
    const summaries = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

    const revenueTrend = summaries.map((s) => ({ month: s.month, amount: s.revenue }));
    const expenseTrend = summaries.map((s) => ({ month: s.month, amount: s.expense }));

    return {
      period: {
        startDate,
        endDate,
      },
      revenueTrend,
      expenseTrend,
      monthlySummaries: summaries.map((s) => ({
        ...s,
        netProfit: s.revenue - s.expense,
      })),
    };
  }

  async getSalesDashboard(businessId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { businessId, deletedAt: null },
      select: {
        totalAmount: true,
        paidAmount: true,
        dueAmount: true,
        dueDate: true,
      },
    });

    const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);
    const outstandingReceivables = invoices.reduce((sum: number, inv: any) => sum + Number(inv.dueAmount), 0);

    const now = new Date();
    const overdueReceivables = invoices
      .filter((inv: any) => inv.dueDate && new Date(inv.dueDate) < now)
      .reduce((sum: number, inv: any) => sum + Number(inv.dueAmount), 0);

    const completedPayments = await prisma.payment.aggregate({
      where: { businessId, status: 'COMPLETED' },
      _sum: {
        amount: true,
      },
    });
    const totalCollected = Number(completedPayments._sum.amount || 0);

    const customerCount = await prisma.customer.count({
      where: { businessId, deletedAt: null },
    });

    return {
      totalInvoiced,
      totalCollected,
      outstandingReceivables,
      overdueReceivables,
      customerCount,
    };
  }
}
