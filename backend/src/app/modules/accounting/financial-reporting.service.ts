import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import { AccountType, Account, JournalLine } from '../../../generated/client';
import { ReportingService } from './reporting.service';

interface AccountWithJournalLines extends Account {
  journalLines: JournalLine[];
}

interface TrialBalanceItem {
  accountId: string;
  accountName: string;
  accountType: AccountType;
  totalDebit: number;
  totalCredit: number;
  netBalance: number;
}

const reportingService = new ReportingService();

export class FinancialReportingService {
  /**
   * Generates a Trial Balance report
   * Uses ReportingService for cached/optimized logic
   */
  async getTrialBalance(businessId: string, startDate?: Date, endDate?: Date) {
    // If dates are provided, we can use the cached ReportingService
    if (startDate && endDate) {
      return reportingService.getTrialBalance(businessId, { startDate, endDate });
    }

    // Default to existing logic if no dates provided (or we can default dates to current year)
    const sDate = startDate || new Date(new Date().getFullYear(), 0, 1);
    const eDate = endDate || new Date();
    
    return reportingService.getTrialBalance(businessId, { startDate: sDate, endDate: eDate });
  }

  /**
   * Generates a Profit and Loss (Income Statement)
   * Revenue - COGS - Expenses
   */
  async getProfitAndLoss(businessId: string, startDate: Date, endDate: Date) {
    const accounts = await prisma.account.findMany({
      where: {
        businessId,
        type: {
          in: [AccountType.REVENUE, AccountType.EXPENSE],
        },
      },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              businessId,
              date: {
                gte: startDate,
                lte: endDate,
              },
              status: 'POSTED',
            },
          },
        },
      },
    });

    interface ReportItem {
      name: string;
      amount: number;
    }

    const categories = {
      REVENUE: [] as ReportItem[],
      COGS: [] as ReportItem[],
      EXPENSE: [] as ReportItem[],
    };

    let totalRevenue = 0;
    let totalCogs = 0;
    let totalExpenses = 0;

    accounts.forEach((account: any) => {
      const totalDebit = account.journalLines.reduce((sum: number, line: JournalLine) => sum + Number(line.debit), 0);
      const totalCredit = account.journalLines.reduce((sum: number, line: JournalLine) => sum + Number(line.credit), 0);

      const balance = totalCredit - totalDebit; 

      const item = {
        name: account.name,
        amount: Math.abs(balance),
      };

      if (account.type === AccountType.REVENUE) {
        categories.REVENUE.push(item);
        totalRevenue += item.amount;
      } else if (account.name.toUpperCase().includes('COGS')) {
        categories.COGS.push(item);
        totalCogs += item.amount;
      } else {
        categories.EXPENSE.push(item);
        totalExpenses += item.amount;
      }
    });

    const grossProfit = totalRevenue - totalCogs;
    const netIncome = grossProfit - totalExpenses;

    return {
      startDate,
      endDate,
      categories,
      totals: {
        totalRevenue,
        totalCogs,
        grossProfit,
        totalExpenses,
        netIncome,
      },
    };
  }

  /**
   * Generates a Balance Sheet
   * Assets = Liabilities + Equity
   */
  async getBalanceSheet(businessId: string, date: Date = new Date()) {
    const accounts = await prisma.account.findMany({
      where: {
        businessId,
        type: {
          in: [AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY],
        },
      },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              businessId,
              date: {
                lte: date,
              },
              status: 'POSTED',
            },
          },
        },
      },
    });

    interface BalanceItem {
      name: string;
      balance: number;
    }

    const categories = {
      ASSETS: [] as BalanceItem[],
      LIABILITIES: [] as BalanceItem[],
      EQUITY: [] as BalanceItem[],
    };

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    accounts.forEach((account: any) => {
      const totalDebit = account.journalLines.reduce((sum: number, line: JournalLine) => sum + Number(line.debit), 0);
      const totalCredit = account.journalLines.reduce((sum: number, line: JournalLine) => sum + Number(line.credit), 0);

      
      let balance = 0;
      if (account.type === AccountType.ASSET) {
        balance = totalDebit - totalCredit;
        categories.ASSETS.push({ name: account.name, balance });
        totalAssets += balance;
      } else if (account.type === AccountType.LIABILITY) {
        balance = totalCredit - totalDebit;
        categories.LIABILITIES.push({ name: account.name, balance });
        totalLiabilities += balance;
      } else if (account.type === AccountType.EQUITY) {
        balance = totalCredit - totalDebit;
        categories.EQUITY.push({ name: account.name, balance });
        totalEquity += balance;
      }
    });

    return {
      asOfDate: date,
      categories,
      totals: {
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      },
    };
  }
}
