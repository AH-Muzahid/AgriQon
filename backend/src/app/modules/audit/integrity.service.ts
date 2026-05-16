import { prisma } from '../../lib/prisma';

export class IntegrityService {
  /**
   * Runs a series of database integrity checks to ensure data consistency.
   * This is critical for ERP systems where balance mismatches can be disastrous.
   */
  async runAccountingIntegrityCheck(businessId: string) {
    const results: any[] = [];
    let overallStatus = 'PASS';

    // 1. Check if Journal Entries balance (Debits === Credits)
    const journalBalances = await prisma.$queryRaw`
      SELECT "journalId", SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE -amount END) as balance
      FROM "JournalEntry"
      WHERE "businessId" = ${businessId}
      GROUP BY "journalId"
      HAVING SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE -amount END) <> 0
    `;

    if ((journalBalances as any[]).length > 0) {
      overallStatus = 'FAIL';
      results.push({
        check: 'JOURNAL_BALANCE',
        status: 'FAIL',
        message: 'Unbalanced journal entries found',
        data: journalBalances
      });
    } else {
      results.push({
        check: 'JOURNAL_BALANCE',
        status: 'PASS',
        message: 'All journals are balanced'
      });
    }

    // 2. Check for missing StockMovement for Orders
    const missingStockMovements = await prisma.$queryRaw`
      SELECT o.id, o.status
      FROM "Order" o
      LEFT JOIN "StockMovement" sm ON o.id = sm.reference
      WHERE o."businessId" = ${businessId}
      AND o.status = 'DELIVERED'
      AND sm.id IS NULL
    `;

    if ((missingStockMovements as any[]).length > 0) {
      overallStatus = 'WARNING';
      results.push({
        check: 'ORDER_STOCK_MOVEMENT',
        status: 'WARNING',
        message: 'Delivered orders missing stock movements',
        data: missingStockMovements
      });
    }

    // 3. Persist the check result
    const check = await prisma.databaseIntegrityCheck.create({
      data: {
        businessId,
        reportType: 'ACCOUNTING_HEALTH',
        status: overallStatus,
        summary: `Integrity check finished with status: ${overallStatus}`,
        results: results as any
      }
    });

    return check;
  }
}
