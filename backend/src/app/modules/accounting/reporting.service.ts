import { prisma } from '../../lib/prisma';
import { redis } from '../../lib/redis';
import { JournalStatus, AccountType } from '../../../generated/client';

export class ReportingService {
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  /**
   * Generates a Trial Balance report with Redis caching.
   */
  async getTrialBalance(businessId: string, params: { startDate: Date; endDate: Date }) {
    const cacheKey = `REPORT:TRIAL_BALANCE:${businessId}:${params.startDate.getTime()}:${params.endDate.getTime()}`;
    
    // 1. Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Generate Report
    const reportData = await this.generateTrialBalance(businessId, params);

    // 3. Save to Redis
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(reportData));

    return reportData;
  }

  /**
   * Generates a Profit and Loss report with Redis caching.
   */
  async getProfitAndLoss(businessId: string, params: { startDate: Date; endDate: Date }) {
    const cacheKey = `REPORT:PL:${businessId}:${params.startDate.getTime()}:${params.endDate.getTime()}`;
    
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const reportData = await this.generateProfitAndLoss(businessId, params);
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(reportData));

    return reportData;
  }

  /**
   * Generates a Balance Sheet report with Redis caching.
   */
  async getBalanceSheet(businessId: string, date: Date) {
    const cacheKey = `REPORT:BS:${businessId}:${date.getTime()}`;
    
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const reportData = await this.generateBalanceSheet(businessId, date);
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(reportData));

    return reportData;
  }

  private async generateTrialBalance(businessId: string, params: { startDate: Date; endDate: Date }) {
    const accounts = await prisma.account.findMany({
      where: { businessId },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              status: JournalStatus.POSTED,
              date: {
                gte: params.startDate,
                lte: params.endDate
              }
            }
          }
        }
      }
    });

    const report = accounts.map((account: any) => {
      const debit = account.journalLines.reduce((sum: number, line: any) => sum + Number(line.debit), 0);
      const credit = account.journalLines.reduce((sum: number, line: any) => sum + Number(line.credit), 0);
      
      return {
        accountId: account.id,
        accountName: account.name,
        accountCode: account.code,
        accountType: account.type,
        debit,
        credit,
        balance: account.type === AccountType.ASSET || account.type === AccountType.EXPENSE 
          ? debit - credit 
          : credit - debit
      };
    });

    const totalDebits = report.reduce((sum: number, item: any) => sum + item.debit, 0);
    const totalCredits = report.reduce((sum: number, item: any) => sum + item.credit, 0);

    return {
      startDate: params.startDate,
      endDate: params.endDate,
      report,
      summary: {
        totalDebits,
        totalCredits,
        isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      }
    };
  }

  private async generateProfitAndLoss(businessId: string, params: { startDate: Date; endDate: Date }) {
    const accounts = await prisma.account.findMany({
      where: {
        businessId,
        type: { in: [AccountType.REVENUE, AccountType.EXPENSE] }
      },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              status: JournalStatus.POSTED,
              date: { gte: params.startDate, lte: params.endDate }
            }
          }
        }
      }
    });

    let totalRevenue = 0;
    let totalCogs = 0;
    let totalExpenses = 0;

    const categories: any = { REVENUE: [], COGS: [], EXPENSE: [] };

    accounts.forEach((account: any) => {
      const debit = account.journalLines.reduce((sum: number, line: any) => sum + Number(line.debit), 0);
      const credit = account.journalLines.reduce((sum: number, line: any) => sum + Number(line.credit), 0);
      
      const balance = account.type === AccountType.REVENUE ? credit - debit : debit - credit;
      const item = { name: account.name, code: account.code, amount: balance };

      if (account.type === AccountType.REVENUE) {
        categories.REVENUE.push(item);
        totalRevenue += balance;
      } else if (account.name.toUpperCase().includes('COGS') || account.code.startsWith('5')) { // Common COGS pattern
        categories.COGS.push(item);
        totalCogs += balance;
      } else {
        categories.EXPENSE.push(item);
        totalExpenses += balance;
      }
    });

    return {
      startDate: params.startDate,
      endDate: params.endDate,
      categories,
      totals: {
        totalRevenue,
        totalCogs,
        grossProfit: totalRevenue - totalCogs,
        totalExpenses,
        netIncome: totalRevenue - totalCogs - totalExpenses
      }
    };
  }

  private async generateBalanceSheet(businessId: string, date: Date) {
    const accounts = await prisma.account.findMany({
      where: {
        businessId,
        type: { in: [AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY] }
      },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              status: JournalStatus.POSTED,
              date: { lte: date }
            }
          }
        }
      }
    });

    const categories: any = { ASSETS: [], LIABILITIES: [], EQUITY: [] };
    let totalAssets = 0, totalLiabilities = 0, totalEquity = 0;

    accounts.forEach((account: any) => {
      const debit = account.journalLines.reduce((sum: number, line: any) => sum + Number(line.debit), 0);
      const credit = account.journalLines.reduce((sum: number, line: any) => sum + Number(line.credit), 0);
      
      let balance = 0;
      if (account.type === AccountType.ASSET) {
        balance = debit - credit;
        categories.ASSETS.push({ name: account.name, balance });
        totalAssets += balance;
      } else if (account.type === AccountType.LIABILITY) {
        balance = credit - debit;
        categories.LIABILITIES.push({ name: account.name, balance });
        totalLiabilities += balance;
      } else {
        balance = credit - debit;
        categories.EQUITY.push({ name: account.name, balance });
        totalEquity += balance;
      }
    });

    // We also need to add Net Income (Retained Earnings) for the current period to Equity
    // This is a simplification; a full accounting system would track this in a specific account.
    
    return {
      asOfDate: date,
      categories,
      totals: {
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
      }
    };
  }
}
