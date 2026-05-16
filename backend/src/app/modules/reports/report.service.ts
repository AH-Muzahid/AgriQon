import { prisma } from '../../lib/prisma';
import { Account, AccountType, Category, Inventory, Item, JournalLine, Order, PurchaseOrder, Supplier } from '../../../generated/client';

export class ReportService {
  /**
   * Generates a comprehensive inventory valuation report using WAC.
   */
  async getInventoryValuationReport(businessId: string) {
    // 1. Fetch business details for currency
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true }
    });

    // 2. Fetch all items with their current WAC (costPrice) and inventory levels
    const items = await prisma.item.findMany({
      where: { businessId },
      include: {
        inventory: true,
        category: true,
      }
    });

    const reportData = items.map((item: Item & { inventory: Inventory[], category: Category | null }) => {
      const totalStock = item.inventory.reduce((sum: number, inv: Inventory) => sum + Number(inv.availableStock), 0);
      const unitCost = Number(item.costPrice || 0);
      const totalValue = totalStock * unitCost;

      return {
        id: item.id,
        sku: item.sku,
        name: item.title,
        category: item.category?.name || 'Uncategorized',
        totalStock,
        unitCost,
        totalValue,
        currency: business?.currency || 'USD',
      };
    });

    const grandTotalValue = reportData.reduce((sum: number, item: { totalValue: number }) => sum + item.totalValue, 0);
    const totalItems = reportData.length;

    // Categorized breakdown
    const categoryBreakdown = reportData.reduce((acc: Record<string, number>, item: { category: string, totalValue: number }) => {
      acc[item.category] = (acc[item.category] || 0) + item.totalValue;
      return acc;
    }, {} as Record<string, number>);

    return {
      generatedAt: new Date(),
      businessId,
      currency: business?.currency || 'USD',
      summary: {
        totalItems,
        grandTotalValue,
        categoryBreakdown
      },
      details: reportData
    };
  }

  /**
   * Generates a procurement vs spending report.
   */
  async getProcurementReport(businessId: string, startDate: Date, endDate: Date) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { currency: true }
    });

    const purchases = await prisma.purchaseOrder.findMany({
      where: {
        businessId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        supplier: true,
        items: true
      }
    });

    const totalSpent = purchases.reduce((sum: number, p: PurchaseOrder) => sum + Number(p.total), 0);
    const statusSummary = purchases.reduce((acc: Record<string, number>, p: PurchaseOrder) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      period: { startDate, endDate },
      businessId,
      currency: business?.currency || 'USD',
      summary: {
        purchaseCount: purchases.length,
        totalSpent,
        statusSummary
      },
      purchases: purchases.map((p: PurchaseOrder & { supplier: Supplier }) => ({
        id: p.id,
        supplier: p.supplier.name,
        total: p.total,
        status: p.status,
        date: p.createdAt
      }))
    };
  }

  /**
   * Profit & Loss Report
   */
  async getProfitAndLossReport(businessId: string, startDate: Date, endDate: Date) {
    const accounts = await prisma.account.findMany({
      where: { 
        businessId,
        type: { in: ['REVENUE', 'EXPENSE'] }
      },
      include: {
        journalLines: {
          where: {
            entry: {
              status: 'POSTED',
              createdAt: { gte: startDate, lte: endDate }
            }
          }
        }
      }
    });

    const calculateBalance = (acc: Account & { journalLines: JournalLine[] }) => {
      return acc.journalLines.reduce((sum: number, line: JournalLine) => {
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        if (acc.type === 'REVENUE') return sum + (credit - debit);
        return sum + (debit - credit);
      }, 0);
    };

    const revenues = accounts.filter((a: Account) => a.type === 'REVENUE').map((a: Account & { journalLines: JournalLine[] }) => ({
      name: a.name,
      code: a.code,
      amount: calculateBalance(a)
    }));

    const expenses = accounts.filter((a: Account) => a.type === 'EXPENSE').map((a: Account & { journalLines: JournalLine[] }) => ({
      name: a.name,
      code: a.code,
      amount: calculateBalance(a)
    }));

    const totalRevenue = revenues.reduce((sum: number, r: { amount: number }) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    return {
      period: { startDate, endDate },
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      details: { revenues, expenses }
    };
  }

  /**
   * Balance Sheet Report
   */
  async getBalanceSheetReport(businessId: string, asOfDate: Date) {
    const accounts = await prisma.account.findMany({
      where: { businessId },
      include: {
        journalLines: {
          where: {
            entry: {
              status: 'POSTED',
              createdAt: { lte: asOfDate }
            }
          }
        }
      }
    });

    const calculateBalance = (acc: Account & { journalLines: JournalLine[] }) => {
      return acc.journalLines.reduce((sum: number, line: JournalLine) => {
        const debit = Number(line.debit || 0);
        const credit = Number(line.credit || 0);
        if (['LIABILITY', 'EQUITY', 'REVENUE'].includes(acc.type)) return sum + (credit - debit);
        return sum + (debit - credit);
      }, 0);
    };

    // Note: In a real balance sheet, we'd also include Retained Earnings (Net Profit from all periods prior)
    // For simplicity, we'll categorize them by type.
    const assets = accounts.filter((a: Account) => a.type === 'ASSET').map((a: Account & { journalLines: JournalLine[] }) => ({ name: a.name, amount: calculateBalance(a) }));
    const liabilities = accounts.filter((a: Account) => a.type === 'LIABILITY').map((a: Account & { journalLines: JournalLine[] }) => ({ name: a.name, amount: calculateBalance(a) }));
    const equity = accounts.filter((a: Account) => a.type === 'EQUITY').map((a: Account & { journalLines: JournalLine[] }) => ({ name: a.name, amount: calculateBalance(a) }));

    const totalAssets = assets.reduce((sum: number, a: { amount: number }) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum: number, l: { amount: number }) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);

    return {
      asOfDate,
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      details: { assets, liabilities, equity }
    };
  }

  /**
   * Trial Balance Report
   */
  async getTrialBalanceReport(businessId: string) {
    const accounts = await prisma.account.findMany({
      where: { businessId },
      orderBy: { code: 'asc' }
    });

    const details = accounts.map((acc: Account) => {
      const balance = Number(acc.balance);
      let debit = 0;
      let credit = 0;

      // Determine if natural balance is debit or credit
      if (['ASSET', 'EXPENSE'].includes(acc.type)) {
        if (balance >= 0) debit = balance;
        else credit = Math.abs(balance);
      } else {
        if (balance >= 0) credit = balance;
        else debit = Math.abs(balance);
      }

      return {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit,
        credit
      };
    });

    return {
      generatedAt: new Date(),
      totalDebit: details.reduce((sum: number, d: { debit: number }) => sum + d.debit, 0),
      totalCredit: details.reduce((sum: number, d: { credit: number }) => sum + d.credit, 0),
      details
    };
  }
}
