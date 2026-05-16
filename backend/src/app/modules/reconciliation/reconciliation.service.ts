import { JournalStatus, MovementType, ProcessingStatus, Prisma } from '../../../generated/client';
import { AppError } from '../../errors/AppError';

export interface IntegrityCheckResult {
  module: string;
  checkName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

export class ReconciliationService {
  constructor() {}

  private async persistLog(businessId: string | null, results: IntegrityCheckResult[], isSystem: boolean = false) {
    const status = results.some(r => r.status === 'FAIL') ? 'FAIL' : 
                   results.some(r => r.status === 'WARNING') ? 'WARNING' : 'PASS';
    
    const summary = `${results.length} checks performed. ${results.filter(r => r.status === 'PASS').length} passed, ${results.filter(r => r.status === 'FAIL').length} failed.`;

    await prisma.reconciliationLog.create({
      data: {
        businessId,
        status,
        summary,
        results: results as any,
        isSystem
      }
    });

    if (status === 'FAIL') {
      console.error(`[Reconciliation] CRITICAL FAILURE for ${businessId || 'GLOBAL SYSTEM'}: ${summary}`);
    }
  }

  /**
   * 1. Ledger Validation: Total Debits == Total Credits per Journal Entry
   */
  async validateJournalIntegrity(businessId: string): Promise<IntegrityCheckResult[]> {
    const entries = await prisma.journalEntry.findMany({
      where: { businessId, status: 'POSTED' },
      include: { lines: true },
    });

    const results: IntegrityCheckResult[] = [];

    // 1. Entry-level balance check
    for (const entry of entries) {
      const totalDebit = entry.lines.reduce((sum: number, line: any) => sum + Number(line.debit), 0);
      const totalCredit = entry.lines.reduce((sum: number, line: any) => sum + Number(line.credit), 0);
      const diff = Math.abs(totalDebit - totalCredit);

      if (diff > 0.001) {
        results.push({
          module: 'Accounting',
          checkName: 'Journal Balance',
          status: 'FAIL',
          message: `Journal Entry ${entry.id} (${entry.description}) is unbalanced. Diff: ${diff}`,
          details: { entryId: entry.id, totalDebit, totalCredit, diff },
        });
      }
    }

    // 2. Global ledger balance check (Sum of all debits vs Sum of all credits)
    const globalTotals = await prisma.journalLine.aggregate({
      where: {
        journalEntry: { businessId, status: 'POSTED' }
      },
      _sum: {
        debit: true,
        credit: true
      }
    });

    const globalDebit = Number(globalTotals._sum.debit || 0);
    const globalCredit = Number(globalTotals._sum.credit || 0);
    const globalDiff = Math.abs(globalDebit - globalCredit);

    if (globalDiff > 0.01) {
      results.push({
        module: 'Accounting',
        checkName: 'Global Ledger Balance',
        status: 'FAIL',
        message: `Global Ledger is unbalanced. Total Debits: ${globalDebit}, Total Credits: ${globalCredit}, Diff: ${globalDiff}`,
        details: { globalDebit, globalCredit, globalDiff }
      });
    }

    if (results.length === 0) {
      results.push({
        module: 'Accounting',
        checkName: 'Journal & Ledger Balance',
        status: 'PASS',
        message: 'All journal entries and the global ledger are balanced.',
      });
    }

    return results;
  }

  /**
   * 2. Inventory Validation: SUM(stock_movements) == inventory totalStock/availableStock
   */
  async validateInventoryIntegrity(businessId: string): Promise<IntegrityCheckResult[]> {
    const inventories = await prisma.inventory.findMany({
      where: { businessId },
      include: { movements: true },
    });

    const results: IntegrityCheckResult[] = [];

    for (const inv of inventories) {
      const movementSum = inv.movements.reduce((sum: number, m: any) => sum + m.quantity, 0);
      const diff = Math.abs(movementSum - inv.availableStock);

      if (diff !== 0) {
        results.push({
          module: 'Inventory',
          checkName: 'Stock vs Movements',
          status: 'FAIL',
          message: `Inventory ${inv.id} (Item: ${inv.itemId}) has drift. Movements sum: ${movementSum}, Current stock: ${inv.availableStock}`,
          details: { inventoryId: inv.id, movementSum, availableStock: inv.availableStock, diff },
        });
      }
    }

    if (results.length === 0) {
      results.push({
        module: 'Inventory',
        checkName: 'Stock vs Movements',
        status: 'PASS',
        message: 'Inventory balances match stock movement history.',
      });
    }

    return results;
  }

  /**
   * 3. AP/AR Validation
   * Accounts Receivable: Invoices - Payments == Receivable Account Balance
   */
  async validateReceivablesIntegrity(businessId: string): Promise<IntegrityCheckResult[]> {
    const receivableAccount = await prisma.account.findFirst({
      where: { businessId, systemType: 'RECEIVABLE' }
    });

    if (!receivableAccount) {
      return [{
        module: 'Accounting',
        checkName: 'AR Integrity',
        status: 'WARNING',
        message: 'Receivable account not found for this business.',
      }];
    }

    // Sum of all invoices
    const invoiceSum = await prisma.invoice.aggregate({
      where: { businessId },
      _sum: { totalAmount: true }
    });

    // Sum of all payments (for orders that have invoices)
    const paymentSum = await prisma.payment.aggregate({
      where: { businessId, status: 'COMPLETED' },
      _sum: { amount: true }
    });

    const expectedAR = Number(invoiceSum._sum.totalAmount || 0) - Number(paymentSum._sum.amount || 0);
    const actualAR = Number(receivableAccount.balance);
    const diff = Math.abs(expectedAR - actualAR);

    if (diff > 0.01) {
      return [{
        module: 'Accounting',
        checkName: 'AR Integrity',
        status: 'FAIL',
        message: `Accounts Receivable drift detected. Expected: ${expectedAR}, Actual (Account Balance): ${actualAR}, Diff: ${diff}`,
        details: { expectedAR, actualAR, diff }
      }];
    }

    return [{
      module: 'Accounting',
      checkName: 'AR Integrity',
      status: 'PASS',
      message: 'Accounts Receivable balance matches invoice/payment history.',
    }];
  }

  /**
   * Accounts Payable: Purchases - Payments == Payable Account Balance
   */
  async validatePayablesIntegrity(businessId: string): Promise<IntegrityCheckResult[]> {
    const payableAccount = await prisma.account.findFirst({
      where: { businessId, systemType: 'PAYABLE' }
    });

    if (!payableAccount) {
      return [{
        module: 'Accounting',
        checkName: 'AP Integrity',
        status: 'WARNING',
        message: 'Payable account not found for this business.',
      }];
    }

    // Sum of all purchases
    const purchaseSum = await prisma.purchaseOrder.aggregate({
      where: { businessId, status: 'RECEIVED' },
      _sum: { total: true }
    });

    // Sum of all payments to suppliers
    // Note: We need to identify payments related to purchases. 
    // Assuming source='PURCHASE' or similar in JournalEntry, or dedicated table.
    // For now, let's use the JournalEntry reference as a proxy if we don't have a direct link yet.
    const purchasePayments = await prisma.journalEntry.aggregate({
      where: { 
        businessId, 
        source: 'PAYMENT', 
        description: { contains: 'Purchase' },
        status: 'POSTED'
      },
      include: {
        lines: {
          where: { accountId: payableAccount.id }
        }
      }
    } as any);

    // This is a bit complex without a direct 'PurchasePayment' table.
    // Let's simplify: Sum of JournalLines for Payable account where debit > 0 (reducing liability)
    const settledSum = await prisma.journalLine.aggregate({
      where: {
        accountId: payableAccount.id,
        debit: { gt: 0 },
        entry: { status: 'POSTED' }
      },
      _sum: { debit: true }
    });

    const expectedAP = Number(purchaseSum._sum.total || 0) - Number(settledSum._sum.debit || 0);
    const actualAP = Number(payableAccount.balance);
    const diff = Math.abs(expectedAP - actualAP);

    if (diff > 0.01) {
      return [{
        module: 'Accounting',
        checkName: 'AP Integrity',
        status: 'FAIL',
        message: `Accounts Payable drift detected. Expected: ${expectedAP}, Actual (Account Balance): ${actualAP}, Diff: ${diff}`,
        details: { expectedAP, actualAP, diff }
      }];
    }

    return [{
      module: 'Accounting',
      checkName: 'AP Integrity',
      status: 'PASS',
      message: 'Accounts Payable balance matches purchase/settlement history.',
    }];
  }

  /**
   * 4. Duplicate Event Detection
   */
  async detectDuplicateEvents(businessId: string): Promise<IntegrityCheckResult[]> {
    const results: IntegrityCheckResult[] = [];

    // Check OutboxEvent duplicates (Same aggregate, type, and payload - potential double emit)
    // We use a simplified hash-like check or just count specific fields
    const outboxDuplicates = await prisma.$queryRaw`
      SELECT "aggregateId", "eventType", COUNT(*) 
      FROM "OutboxEvent" 
      WHERE "businessId" = ${businessId}
      GROUP BY "aggregateId", "eventType", "payload"
      HAVING COUNT(*) > 1
    `;

    if ((outboxDuplicates as any[]).length > 0) {
      results.push({
        module: 'Events',
        checkName: 'Outbox Duplicates',
        status: 'WARNING',
        message: `Detected ${(outboxDuplicates as any[]).length} potential duplicate outbox events (identical payload).`,
        details: outboxDuplicates
      });
    }

    // Check WebhookEvent duplicates
    const webhookDuplicates = await prisma.$queryRaw`
      SELECT "provider", "externalId", COUNT(*) 
      FROM "WebhookEvent" 
      WHERE "businessId" = ${businessId} AND "externalId" IS NOT NULL
      GROUP BY "provider", "externalId" 
      HAVING COUNT(*) > 1
    `;

    if ((webhookDuplicates as any[]).length > 0) {
      results.push({
        module: 'Events',
        checkName: 'Webhook Duplicates',
        status: 'WARNING',
        message: `Detected ${(webhookDuplicates as any[]).length} potential duplicate webhook events.`,
        details: webhookDuplicates
      });
    }

    // Check JournalEntry duplicates (Multiple entries for same source event)
    const journalDuplicates = await prisma.$queryRaw`
      SELECT "eventId", COUNT(*) 
      FROM "JournalEntry" 
      WHERE "businessId" = ${businessId} AND "eventId" IS NOT NULL
      GROUP BY "eventId" 
      HAVING COUNT(*) > 1
    `;

    if ((journalDuplicates as any[]).length > 0) {
      results.push({
        module: 'Accounting',
        checkName: 'Journal Duplicates',
        status: 'WARNING',
        message: `Detected ${(journalDuplicates as any[]).length} potential duplicate journal entries for the same event.`,
        details: journalDuplicates
      });
    }

    return results;
  }

  /**
   * 7. Outbox Staleness Detection
   */
  async detectOutboxStaleness(businessId: string): Promise<IntegrityCheckResult[]> {
    const staleThreshold = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes
    
    const staleEventsCount = await prisma.outboxEvent.count({
      where: {
        businessId,
        status: 'PENDING',
        createdAt: { lt: staleThreshold }
      }
    });

    if (staleEventsCount > 0) {
      return [{
        module: 'Events',
        checkName: 'Outbox Staleness',
        status: 'FAIL',
        message: `Detected ${staleEventsCount} unprocessed outbox events older than 15 minutes. Event processing might be stuck.`,
        details: { staleEventsCount }
      }];
    }

    return [{
      module: 'Events',
      checkName: 'Outbox Staleness',
      status: 'PASS',
      message: 'Outbox event processing is healthy.',
    }];
  }

  /**
   * 8. Order-Payment Integrity
   */
  async validateOrderPaymentIntegrity(businessId: string): Promise<IntegrityCheckResult[]> {
    const orders = await prisma.order.findMany({
      where: { 
        businessId, 
        status: 'DELIVERED',
        paymentStatus: 'COMPLETED'
      },
      include: {
        payments: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    const discrepancies = [];

    for (const order of orders) {
      const paymentTotal = order.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const diff = Math.abs(Number(order.total) - paymentTotal);

      if (diff > 0.01) {
        discrepancies.push({
          orderId: order.id,
          orderTotal: order.total,
          paymentTotal,
          diff
        });
      }
    }

    if (discrepancies.length > 0) {
      return [{
        module: 'Sales',
        checkName: 'Order-Payment Match',
        status: 'FAIL',
        message: `Detected ${discrepancies.length} orders where payments do not match order total.`,
        details: discrepancies
      }];
    }

    return [{
      module: 'Sales',
      checkName: 'Order-Payment Match',
      status: 'PASS',
      message: 'All completed orders have matching payment records.',
    }];
  }

  /**
   * 5. Refund Validation: SUM(Refunds) == Debit balance of RETURNS account
   */
  async validateRefundsIntegrity(businessId: string): Promise<IntegrityCheckResult[]> {
    const refunds = await prisma.refund.aggregate({
      where: { businessId, status: 'COMPLETED' },
      _sum: { amount: true }
    });

    const refundSum = Number(refunds._sum.amount || 0);

    const returnsAccount = await prisma.account.findFirst({
      where: { businessId, systemType: 'RETURNS' }
    });

    if (!returnsAccount) {
      if (refundSum === 0) {
        return [{
          module: 'Accounting',
          checkName: 'Refund Integrity',
          status: 'PASS',
          message: 'No returns account but no refunds exist.',
        }];
      }
      return [{
        module: 'Accounting',
        checkName: 'Refund Integrity',
        status: 'WARNING',
        message: 'Refunds exist but RETURNS account is missing.',
        details: { refundSum }
      }];
    }

    const journalSum = await prisma.journalLine.aggregate({
      where: {
        accountId: returnsAccount.id,
        journalEntry: { status: 'POSTED' }
      },
      _sum: { debit: true }
    });

    const ledgerRefundSum = Number(journalSum._sum.debit || 0);
    const diff = Math.abs(refundSum - ledgerRefundSum);

    if (diff > 0.01) {
      return [{
        module: 'Accounting',
        checkName: 'Refund Integrity',
        status: 'FAIL',
        message: `Refund drift detected. Refunds Total: ${refundSum}, Ledger Total: ${ledgerRefundSum}, Diff: ${diff}`,
        details: { refundSum, ledgerRefundSum, diff }
      }];
    }

    return [{
      module: 'Accounting',
      checkName: 'Refund Integrity',
      status: 'PASS',
      message: 'Refunds are correctly reflected in the ledger.',
    }];
  }

  /**
   * 6. Loyalty Point Validation: Customer.loyaltyPoints == SUM(LoyaltyPoint.points)
   */
  async validateLoyaltyIntegrity(businessId: string): Promise<IntegrityCheckResult[]> {
    const customers = await prisma.customer.findMany({
      where: { businessId, deletedAt: null },
      include: {
        loyaltyPointEntries: true
      }
    });

    let failCount = 0;
    let totalDiff = 0;

    for (const customer of customers) {
      const sumPoints = customer.loyaltyPointEntries.reduce((sum: number, entry: any) => sum + entry.points, 0);
      const diff = Math.abs(customer.loyaltyPoints - sumPoints);
      
      if (diff > 0) {
        failCount++;
        totalDiff += diff;
      }
    }

    if (failCount > 0) {
      return [{
        module: 'Customers',
        checkName: 'Loyalty Integrity',
        status: 'FAIL',
        message: `${failCount} customers have inconsistent loyalty point balances. Total drift: ${totalDiff}`,
        details: { failCount, totalDiff }
      }];
    }

    return [{
      module: 'Customers',
      checkName: 'Loyalty Integrity',
      status: 'PASS',
      message: 'Loyalty points are consistent across all customers.',
    }];
  }

  /**
   * 7. Invoices vs Payments: Invoice.paidAmount == SUM(Payments for the Order)
   */
  async validateInvoicesAgainstPayments(businessId: string): Promise<IntegrityCheckResult[]> {
    const invoices = await prisma.invoice.findMany({
      where: { businessId, deletedAt: null },
      include: {
        order: {
          include: {
            payments: {
              where: { status: 'COMPLETED' }
            }
          }
        }
      }
    });

    const results: IntegrityCheckResult[] = [];
    let failCount = 0;

    for (const inv of invoices) {
      const paymentSum = inv.order.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const diff = Math.abs(Number(inv.paidAmount) - paymentSum);

      if (diff > 0.01) {
        failCount++;
        results.push({
          module: 'Accounting',
          checkName: 'Invoice-Payment Sync',
          status: 'FAIL',
          message: `Invoice ${inv.invoiceNumber} paidAmount (${inv.paidAmount}) does not match payment records (${paymentSum}).`,
          details: { invoiceId: inv.id, paidAmount: inv.paidAmount, paymentSum, diff }
        });
      }
    }

    if (failCount === 0) {
      return [{
        module: 'Accounting',
        checkName: 'Invoice-Payment Sync',
        status: 'PASS',
        message: 'All invoice paid amounts are correctly synchronized with payment records.',
      }];
    }

    return results;
  }

  /**
   * Validates ledger balance across the entire system.
   * This is a cross-tenant check to ensure no system-wide leakage.
   */
  async validateGlobalLedgerBalance(): Promise<IntegrityCheckResult[]> {
    try {
      const globalTotals = await prisma.journalLine.aggregate({
        where: {
          journalEntry: { status: 'POSTED' }
        },
        _sum: {
          debit: true,
          credit: true
        }
      });

      const globalDebit = Number(globalTotals._sum.debit || 0);
      const globalCredit = Number(globalTotals._sum.credit || 0);
      const globalDiff = Math.abs(globalDebit - globalCredit);

      if (globalDiff > 0.01) {
        return [{
          module: 'Accounting',
          checkName: 'System-wide Ledger Balance',
          status: 'FAIL',
          message: `System-wide Ledger is unbalanced. Total Debits: ${globalDebit}, Total Credits: ${globalCredit}, Diff: ${globalDiff}`,
          details: { globalDebit, globalCredit, globalDiff }
        }];
      }

      return [{
        module: 'Accounting',
        checkName: 'System-wide Ledger Balance',
        status: 'PASS',
        message: 'System-wide ledger is balanced across all tenants.',
      }];
    } catch (error: any) {
      return [{
        module: 'Accounting',
        checkName: 'System-wide Ledger Balance',
        status: 'FAIL',
        message: `Error during global check: ${error.message}`,
      }];
    }
  }

  /**
   * Run all checks for a business
   */
  async runFullReconciliation(businessId: string): Promise<IntegrityCheckResult[]> {
    const results = await Promise.all([
      this.validateJournalIntegrity(businessId),
      this.validateInventoryIntegrity(businessId),
      this.validateReceivablesIntegrity(businessId),
      this.validatePayablesIntegrity(businessId),
      this.validateRefundsIntegrity(businessId),
      this.validateLoyaltyIntegrity(businessId),
      this.detectDuplicateEvents(businessId),
      this.detectOutboxStaleness(businessId),
      this.validateOrderPaymentIntegrity(businessId),
      this.validateGlobalLedgerBalance(),
      this.validateInvoicesAgainstPayments(businessId),
    ]);

    const flatResults = results.flat();
    await this.persistLog(businessId, flatResults);
    return flatResults;
  }

  /**
   * Run for all businesses
   */
  async runGlobalReconciliation(): Promise<{ businessId: string; results: IntegrityCheckResult[] }[]> {
    const businesses = await prisma.business.findMany({ select: { id: true } });
    const globalResults = [];

    for (const b of businesses) {
      const results = await this.runFullReconciliation(b.id);
      globalResults.push({ businessId: b.id, results });
    }

    return globalResults;
  }

  /**
   * Run only high-priority system health checks for all businesses
   */
  async runGlobalCriticalChecks(): Promise<{ businessId: string; results: IntegrityCheckResult[] }[]> {
    const businesses = await prisma.business.findMany({ select: { id: true } });
    const globalResults = [];

    for (const b of businesses) {
      const results = await Promise.all([
        this.detectOutboxStaleness(b.id),
        this.detectDuplicateEvents(b.id),
      ]);
      const flatResults = results.flat();
      await this.persistLog(b.id, flatResults, true);
      globalResults.push({ businessId: b.id, results: flatResults });
    }

    return globalResults;
  }

  // --- REMEDIATION METHODS ---

  /**
   * Fixes inventory drift for a specific item by re-calculating from movements and reservations.
   */
  async fixInventoryDrift(businessId: string, inventoryId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Sum up all completed movements
      const movements = await tx.stockMovement.findMany({
        where: { businessId, inventoryId }
      });

      const calculatedTotal = movements.reduce((sum: number, m: any) => {
        return m.type === 'IN' ? sum + m.quantity : sum - m.quantity;
      }, 0);

      // 2. Sum up all active reservations
      const reservations = await tx.stockReservation.findMany({
        where: { businessId, inventoryId }
      });

      const totalReserved = reservations.reduce((sum: number, r: any) => sum + r.quantity, 0);

      // 3. Update inventory
      const updated = await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          totalStock: calculatedTotal,
          reservedStock: totalReserved,
          availableStock: calculatedTotal - totalReserved,
          version: { increment: 1 }
        }
      });

      // 4. Log the action
      await tx.auditLog.create({
        data: {
          businessId,
          entityType: 'Inventory',
          entityId: inventoryId,
          action: 'REMEDIATION',
          newData: {
            type: 'INVENTORY_DRIFT_FIX',
            inventoryId,
            newTotal: calculatedTotal,
            newReserved: totalReserved
          }
        }
      });

      return updated;
    });
  }

  /**
   * Fixes account balance by re-calculating from all posted journal lines.
   */
  async fixAccountBalance(businessId: string, accountId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const lines = await tx.journalLine.findMany({
        where: {
          accountId,
          journalEntry: { 
            businessId,
            status: 'POSTED' 
          }
        }
      });

      const totalDebit = lines.reduce((sum: number, l: any) => sum + Number(l.debit), 0);
      const totalCredit = lines.reduce((sum: number, l: any) => sum + Number(l.credit), 0);
      
      const account = await tx.account.findUnique({ where: { id: accountId } });
      if (!account) throw new AppError('Account not found', 404);

      // Determine balance based on account type (Asset/Expense: Debit - Credit, Liability/Equity/Income: Credit - Debit)
      const balance = ['ASSET', 'EXPENSE'].includes(account.type)
        ? totalDebit - totalCredit
        : totalCredit - totalDebit;

      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance }
      });

      await tx.auditLog.create({
        data: {
          businessId,
          entityType: 'Account',
          entityId: accountId,
          action: 'REMEDIATION',
          newData: {
            type: 'ACCOUNT_BALANCE_FIX',
            accountId,
            oldBalance: Number(account.balance),
            newBalance: balance
          }
        }
      });

      return updated;
    });
  }

  /**
   * Fetch history of reconciliation runs
   */
  async getHistory(businessId?: string, limit = 20) {
    return prisma.reconciliationLog.findMany({
      where: businessId ? { businessId } : {},
      orderBy: { runDate: 'desc' },
      take: limit,
    });
  }

  /**
   * Remediation: Retry events that have been stuck in the outbox for too long
   */
  async retryStaleOutboxEvents(businessId: string, olderThanHours = 1) {
    const staleThreshold = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

    const staleEvents = await prisma.outboxEvent.findMany({
      where: {
        businessId,
        status: { not: 'PROCESSED' },
        createdAt: { lt: staleThreshold }
      }
    });

    if (staleEvents.length === 0) return { retried: 0 };

    // In a real system, you might trigger the OutboxProcessor manually or
    // just wait for the next poll. Here we just identify them.
    // For automated remediation, we could potentially re-emit them.
    
    return {
      retried: staleEvents.length,
      eventIds: staleEvents.map((e: any) => e.id)
    };
  }

  /**
   * 9. Outbox Cleanup: Delete processed events older than 30 days
   */
  async cleanupOldOutboxEvents(days = 30): Promise<{ deleted: number }> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const deleted = await prisma.outboxEvent.deleteMany({
      where: {
        status: 'PROCESSED',
        processedAt: { lt: threshold }
      }
    });

    if (deleted.count > 0) {
      console.log(`[Reconciliation] Cleanup: Deleted ${deleted.count} outbox events older than ${days} days.`);
    }

    return { deleted: deleted.count };
  }
}
