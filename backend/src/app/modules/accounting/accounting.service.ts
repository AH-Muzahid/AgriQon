import { JournalStatus, Prisma } from '../../../generated/client';
import {
  PaymentRefundedPayload,
  InventoryDeductedPayload,
  PurchaseReceivedPayload,
  WarehouseTransferCompletedPayload,
  OrderCreatedPayload,
  PaymentCompletedPayload,
  PurchaseCreatedPayload
} from '../../../shared/events/domain-events';
import { AuditService } from '../audit/audit.service';
import { AccountingRepository } from './accounting.repository';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryRepository } from '../inventory/inventory.repository';
import { FeatureGuardService } from '../subscriptions/feature-guard.service';
import { FeatureCode } from '../subscriptions/types/feature.types';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';

export class AccountingService {
  private accountingRepository: AccountingRepository;
  private auditService: AuditService;

  constructor(
    accountingRepository?: AccountingRepository,
    private featureGuard?: FeatureGuardService,
    private readOnlyGuard?: ReadOnlyGuardService,
  ) {
    this.accountingRepository = accountingRepository || new AccountingRepository();
    this.auditService = new AuditService();
  }

  /**
   * Ensure all mandatory system accounts exist for a business.
   * This is typically called when a new business is created.
   */
  async initializeSystemAccounts(businessId: string) {
    const mandatoryAccounts = [
      { systemType: 'CASH', name: 'Cash on Hand', code: '1010', type: 'ASSET' },
      { systemType: 'RECEIVABLE', name: 'Accounts Receivable', code: '1100', type: 'ASSET' },
      { systemType: 'INVENTORY', name: 'Inventory', code: '1200', type: 'ASSET' },
      { systemType: 'PAYABLE', name: 'Accounts Payable', code: '2100', type: 'LIABILITY' },
      { systemType: 'REVENUE', name: 'Sales Revenue', code: '4000', type: 'REVENUE' },
      { systemType: 'RETURNS', name: 'Sales Returns & Allowances', code: '4100', type: 'REVENUE' },
      { systemType: 'COGS', name: 'Cost of Goods Sold', code: '5000', type: 'EXPENSE' },
    ];

    const results = [];
    for (const config of mandatoryAccounts) {
      const account = await this.accountingRepository.getOrCreateSystemAccount(
        businessId,
        config.systemType,
        {
          name: config.name,
          code: config.code,
          type: config.type as any,
        }
      );
      results.push(account);
    }
    return results;
  }

  async createAccount(businessId: string, data: any, userId?: string) {
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(businessId);
    }
    if (this.featureGuard) {
      await this.featureGuard.validateFeatureAccess(businessId, FeatureCode.ACCOUNTING, userId);
    }
    return this.accountingRepository.createAccount({
      ...data,
      businessId,
    });
  }

  async getAccounts(businessId: string) {
    return this.accountingRepository.findAccounts(businessId);
  }

  /**
   * Create a double-entry journal entry and update account balances atomically.
   * Replaces the legacy single-entry recordTransaction.
   */
  async createJournalEntry(businessId: string, userId: string, data: any) {
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(businessId);
    }
    if (this.featureGuard) {
      await this.featureGuard.validateFeatureAccess(businessId, FeatureCode.ACCOUNTING, userId);
    }
    const { description, reference, source, lines, status } = data;

    const entry = await this.accountingRepository.createJournalEntry({
      businessId,
      description,
      reference,
      source: source || 'MANUAL',
      status: status || JournalStatus.DRAFT,
      lines
    });

    // Log Audit
    await this.auditService.log({
      businessId,
      action: 'CREATE_JOURNAL_ENTRY',
      entityType: 'JournalEntry',
      entityId: entry.id,
      newData: entry
    });

    return entry;
  }

  async reconcileBalances(businessId: string, userId?: string) {
    if (this.featureGuard) {
      await this.featureGuard.validateFeatureAccess(businessId, FeatureCode.ACCOUNTING, userId);
    }
    const accounts = await this.accountingRepository.findAccounts(businessId);
    const results = [];

    for (const account of accounts) {
      // Sum all journal lines for this account
      const lines = await prisma.journalLine.aggregate({
        where: {
          accountId: account.id,
          entry: { status: JournalStatus.POSTED }
        },
        _sum: {
          debit: true,
          credit: true
        }
      });

      const totalDebit = Number(lines._sum.debit || 0);
      const totalCredit = Number(lines._sum.credit || 0);
      
      let expectedBalance = 0;
      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        expectedBalance = totalDebit - totalCredit;
      } else {
        expectedBalance = totalCredit - totalDebit;
      }

      const discrepancy = Math.abs(expectedBalance - Number(account.balance));
      
      results.push({
        accountId: account.id,
        accountName: account.name,
        accountCode: account.code,
        currentBalance: Number(account.balance),
        expectedBalance,
        discrepancy,
        isReconciled: discrepancy < 0.001
      });
    }

    const totalDiscrepancy = results.reduce((sum, r) => sum + r.discrepancy, 0);

    return {
      isSystemHealthy: totalDiscrepancy < 0.001,
      totalDiscrepancy,
      details: results
    };
  }

  async getLedger(businessId: string, filter: any = {}) {
    return this.accountingRepository.findLedgerEntries(businessId, filter);
  }

  async postJournalEntry(id: string, businessId: string, userId: string) {
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(businessId);
    }
    if (this.featureGuard) {
      await this.featureGuard.validateFeatureAccess(businessId, FeatureCode.ACCOUNTING, userId);
    }
    const entry = await this.accountingRepository.postJournalEntry(id, businessId, userId);
    
    // Log Audit
    await this.auditService.log({
      businessId,
      action: 'POST_JOURNAL_ENTRY',
      entityType: 'JournalEntry',
      entityId: id,
      newData: entry
    });

    return entry;
  }

  async initiatePayment(businessId: string, data: any) {
    const { amount, orderId, customerName, customerEmail } = data;
    const gatewayUrl = `https://sandbox.sslcommerz.com/gwprocess/v4/process.php?order_id=${orderId}`;

    return {
      gatewayUrl,
      orderId,
      amount,
      status: 'PENDING',
    };
  }

  async handlePaymentWebhook(payload: any) {
    const { tran_id, status, amount } = payload;
    return {
      transactionId: tran_id,
      status,
      received: amount,
    };
  }

  /**
   * Automatic double-entry for new orders
   * Debit: Accounts Receivable (Asset)
   * Credit: Sales Revenue (Revenue)
   */
  async handleOrderCreated(payload: OrderCreatedPayload, outboxEventId?: string) {
    const { orderId, businessId, total } = payload;

    // Idempotency Check
    const effectiveEventId = outboxEventId || orderId;
    const existing = await this.accountingRepository.findJournalEntryByEventId(effectiveEventId);
    if (existing) {
      console.log(`[AccountingService] Journal for Event ${effectiveEventId} already exists. Skipping.`);
      return existing;
    }

    const receivableAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'RECEIVABLE', {
      name: 'Accounts Receivable',
      code: '1100',
      type: 'ASSET'
    });
    const revenueAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'REVENUE', {
      name: 'Sales Revenue',
      code: '4000',
      type: 'REVENUE'
    });
    const taxAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'TAX_PAYABLE', {
      name: 'Sales Tax Payable',
      code: '2200',
      type: 'LIABILITY'
    });

    const lines = [
      {
        accountId: receivableAccount.id,
        debit: payload.total,
        credit: 0,
        description: `Accounts Receivable for Order #${orderId}`
      },
      {
        accountId: revenueAccount.id,
        debit: 0,
        credit: payload.subtotal,
        description: `Sales Revenue (excl. tax) for Order #${orderId}`
      }
    ];

    if (payload.taxAmount > 0) {
      lines.push({
        accountId: taxAccount.id,
        debit: 0,
        credit: payload.taxAmount,
        description: `Sales Tax Liability for Order #${orderId}`
      });
    }

    const entry = await this.accountingRepository.createJournalEntry({
      businessId,
      description: `Order #${orderId} - Sales Recognition`,
      reference: orderId,
      source: 'SALES',
      eventId: effectiveEventId,
      status: 'POSTED',
      lines
    });

    // Log Audit
    await this.auditService.log({
      businessId,
      action: 'JOURNAL_ENTRY_ORDER',
      entityType: 'JournalEntry',
      entityId: entry.id,
      newData: entry
    });

    return entry;
  }

  /**
   * Automatic double-entry for completed payments
   * Debit: Cash/Bank (Asset)
   * Credit: Accounts Receivable (Asset)
   */
  async handlePaymentCompleted(payload: PaymentCompletedPayload, outboxEventId?: string) {
    const { orderId, businessId, amount, method } = payload;
    // Idempotency Check
    const effectiveEventId = outboxEventId || `PAYMENT_${orderId}`;
    const existing = await this.accountingRepository.findJournalEntryByEventId(effectiveEventId);
    
    let entry = existing;
    if (!existing) {
      const cashAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'CASH', {
        name: 'Cash on Hand',
        code: '1010',
        type: 'ASSET'
      });
      const receivableAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'RECEIVABLE', {
        name: 'Accounts Receivable',
        code: '1100',
        type: 'ASSET'
      });

      entry = await this.accountingRepository.createJournalEntry({
        businessId,
        description: `Payment for Order #${orderId} via ${method}`,
        reference: orderId,
        source: 'PAYMENT',
        eventId: effectiveEventId,
        status: 'POSTED',
        lines: [
          {
            accountId: cashAccount.id,
            debit: amount,
            credit: 0,
            description: `Cash received via ${method}`
          },
          {
            accountId: receivableAccount.id,
            debit: 0,
            credit: amount,
            description: `Receivable cleared`
          }
        ]
      });

      // Log Audit
      await this.auditService.log({
        businessId,
        action: 'JOURNAL_ENTRY_PAYMENT',
        entityType: 'JournalEntry',
        entityId: entry.id,
        newData: entry
      });
    } else {
      console.log(`[Accounting] Journal entry already exists for event ${effectiveEventId}, proceeding to side effects.`);
    }

    // 2. Confirm Stock Reservation (moves from Reserved to Deduced/Gone)
    // Rule 10: Reservation Confirmation on Payment
    const inventoryRepo = new InventoryRepository();
    const inventoryService = new InventoryService(inventoryRepo);
    await inventoryService.confirmStockReservation(orderId, businessId);

    return entry;
  }

  /**
   * Automatic double-entry for received purchases
   * Debit: Inventory (Asset)
   * Credit: Accounts Payable (Liability)
   */
  async handlePurchaseReceived(payload: PurchaseReceivedPayload, outboxEventId?: string) {
    const { purchaseId, businessId, total } = payload;
    // Idempotency Check
    const effectiveEventId = outboxEventId || `PURCHASE_RCV_${purchaseId}`;
    const existing = await this.accountingRepository.findJournalEntryByEventId(effectiveEventId);
    if (existing) return existing;

    const inventoryAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'INVENTORY', {
      name: 'Inventory',
      code: '1200',
      type: 'ASSET'
    });
    const payableAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'PAYABLE', {
      name: 'Accounts Payable',
      code: '2100',
      type: 'LIABILITY'
    });

    const entry = await this.accountingRepository.createJournalEntry({
      businessId,
      description: `Purchase Received #${purchaseId} - Inventory Recognition`,
      reference: purchaseId,
      source: 'PURCHASE',
      eventId: effectiveEventId,
      status: 'POSTED',
      lines: [
        {
          accountId: inventoryAccount.id,
          debit: total,
          credit: 0,
          description: `Inventory increase for Purchase #${purchaseId}`
        },
        {
          accountId: payableAccount.id,
          debit: 0,
          credit: total,
          description: `Accounts Payable for Purchase #${purchaseId}`
        }
      ]
    });

    // Log Audit with detailed context
    await this.auditService.log({
      businessId,
      action: 'JOURNAL_ENTRY_PURCHASE',
      entityType: 'JournalEntry',
      entityId: entry.id,
      newData: entry,
      requestId: outboxEventId // Linking to the event processor's activity
    });

    return entry;
  }

  /**
   * Automatic double-entry for purchase creation (Optional/Draft)
   * Usually PO creation doesn't hit the ledger, but we provide the handler for future use
   * or to record commitments in sub-ledgers.
   */
  async handlePurchaseCreated(payload: PurchaseCreatedPayload, outboxEventId?: string) {
    // For now, PO creation is just logged/audited. 
    // Real accounting happens on handlePurchaseReceived.
    console.log(`[AccountingService] Purchase Created #${payload.purchaseId}. No ledger entry needed yet.`);
    return null;
  }

  /**
   * Automatic double-entry for paid purchases (Supplier Payment)
   * Debit: Accounts Payable (Liability)
   * Credit: Cash/Bank (Asset)
   */
  async handlePurchasePaid(payload: { purchaseId: string; businessId: string; amount: number; supplierId: string }, outboxEventId?: string) {
    const { purchaseId, businessId, amount, supplierId } = payload;
    // Idempotency Check
    const effectiveEventId = outboxEventId || `PURCHASE_PAYMENT_${purchaseId}`;
    const existing = await this.accountingRepository.findJournalEntryByEventId(effectiveEventId);
    if (existing) return existing;

    const payableAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'PAYABLE', {
      name: 'Accounts Payable',
      code: '2100',
      type: 'LIABILITY'
    });
    const cashAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'CASH', {
      name: 'Cash on Hand',
      code: '1010',
      type: 'ASSET'
    });

    const entry = await this.accountingRepository.createJournalEntry({
      businessId,
      description: `Payment for Purchase #${purchaseId}`,
      reference: purchaseId,
      source: 'PAYMENT',
      eventId: effectiveEventId,
      status: 'POSTED',
      lines: [
        {
          accountId: payableAccount.id,
          debit: amount,
          credit: 0,
          description: `Accounts Payable settled for Purchase #${purchaseId}`
        },
        {
          accountId: cashAccount.id,
          debit: 0,
          credit: amount,
          description: `Cash paid to supplier ${supplierId}`
        }
      ]
    });

    // Log Audit
    await this.auditService.log({
      businessId,
      action: 'JOURNAL_ENTRY_PURCHASE_PAYMENT',
      entityType: 'JournalEntry',
      entityId: entry.id,
      newData: entry
    });

    return entry;
  }

  /**
   * Automatic double-entry for refunds
   * Debit: Sales Returns / Refund Expense (Expense/Revenue-Contra)
   * Credit: Cash/Bank (Asset)
   */
  async handlePaymentRefunded(payload: PaymentRefundedPayload, outboxEventId?: string) {
    const { orderId, businessId, amount, reason, paymentId } = payload;
    const effectiveEventId = outboxEventId || `REFUND_${paymentId}`;

    // Idempotency Check
    const existing = await this.accountingRepository.findJournalEntryByEventId(effectiveEventId);
    if (existing) return existing;

    const returnsAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'RETURNS', {
      name: 'Sales Returns & Allowances',
      code: '4100',
      type: 'REVENUE' // Contra-revenue
    });
    const cashAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'CASH', {
      name: 'Cash on Hand',
      code: '1010',
      type: 'ASSET'
    });

    const entry = await this.accountingRepository.createJournalEntry({
      businessId,
      description: `Refund for Order #${orderId}${reason ? ': ' + reason : ''}`,
      reference: paymentId,
      source: 'REFUND',
      eventId: effectiveEventId,
      status: 'POSTED',
      lines: [
        {
          accountId: returnsAccount.id,
          debit: amount,
          credit: 0,
          description: `Sales Return/Refund`
        },
        {
          accountId: cashAccount.id,
          debit: 0,
          credit: amount,
          description: `Cash refunded`
        }
      ]
    });

    await this.auditService.log({
      businessId,
      action: 'JOURNAL_ENTRY_REFUND',
      entityType: 'JournalEntry',
      entityId: entry.id,
      newData: entry
    });

    return entry;
  }

  /**
   * Automatic double-entry for inventory deduction (COGS Recognition)
   * Debit: Cost of Goods Sold (Expense)
   * Credit: Inventory (Asset)
   */
  async handleInventoryDeducted(payload: InventoryDeductedPayload, outboxEventId?: string) {
    const { orderId, businessId, quantity, costPrice, itemId } = payload;
    const totalCogs = quantity * costPrice;
    // Idempotency Check
    const effectiveEventId = outboxEventId || `COGS_${orderId}_${itemId}`;
    const existing = await this.accountingRepository.findJournalEntryByEventId(effectiveEventId);
    if (existing) return existing;

    const cogsAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'COGS', {
      name: 'Cost of Goods Sold',
      code: '5000',
      type: 'EXPENSE'
    });
    const inventoryAccount = await this.accountingRepository.getOrCreateSystemAccount(businessId, 'INVENTORY', {
      name: 'Inventory',
      code: '1200',
      type: 'ASSET'
    });

    const entry = await this.accountingRepository.createJournalEntry({
      businessId,
      description: `COGS Recognition for Order #${orderId} - Item ${itemId}`,
      reference: orderId,
      source: 'INVENTORY',
      eventId: effectiveEventId,
      status: 'POSTED',
      lines: [
        {
          accountId: cogsAccount.id,
          debit: totalCogs,
          credit: 0,
          description: `Cost of Goods Sold (${quantity} units)`
        },
        {
          accountId: inventoryAccount.id,
          debit: 0,
          credit: totalCogs,
          description: `Inventory reduction`
        }
      ]
    });

    await this.auditService.log({
      businessId,
      action: 'JOURNAL_ENTRY_COGS',
      entityType: 'JournalEntry',
      entityId: entry.id,
      newData: entry
    });

    return entry;
  }

  /**
   * Automatic double-entry for warehouse transfers
   * Debit: Inventory (Asset) - Destination
   * Credit: Inventory (Asset) - Source
   * 
   * Note: Since both warehouses use the same system Inventory account, 
   * the net balance doesn't change, but we record the movement in the ledger.
   */
  async handleWarehouseTransferCompleted(payload: WarehouseTransferCompletedPayload, outboxEventId?: string, tx?: Prisma.TransactionClient) {
    const { transferId, businessId, totalValue, sourceWarehouseId, destinationWarehouseId } = payload;
    const repository = tx ? new AccountingRepository(tx) : this.accountingRepository;

    const effectiveEventId = outboxEventId || `TRANSFER_${transferId}`;

    // Idempotency Check
    const existing = await repository.findJournalEntryByEventId(effectiveEventId);
    if (existing) return existing;

    const inventoryAccount = await repository.getOrCreateSystemAccount(businessId, 'INVENTORY', {
      name: 'Inventory',
      code: '1200',
      type: 'ASSET'
    });

    const entry = await repository.createJournalEntry({
      businessId,
      description: `Warehouse Transfer #${transferId} from ${sourceWarehouseId} to ${destinationWarehouseId}`,
      reference: transferId,
      source: 'INVENTORY',
      eventId: effectiveEventId,
      status: 'POSTED',
      lines: [
        {
          accountId: inventoryAccount.id,
          debit: totalValue,
          credit: 0,
          description: `Transfer IN to Warehouse: ${destinationWarehouseId}`
        },
        {
          accountId: inventoryAccount.id,
          debit: 0,
          credit: totalValue,
          description: `Transfer OUT from Warehouse: ${sourceWarehouseId}`
        }
      ]
    });

    await this.auditService.log({
      businessId,
      action: 'JOURNAL_ENTRY_TRANSFER',
      entityType: 'JournalEntry',
      entityId: entry.id,
      newData: entry,
      tx
    });

    return entry;
  }
}
