import { Prisma } from '../../../generated/client';
import { AccountingRepository } from './accounting.repository';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';

export class AccountingService {
  private accountingRepository: AccountingRepository;

  constructor() {
    this.accountingRepository = new AccountingRepository();
  }

  async createAccount(businessId: string, data: any) {
    return this.accountingRepository.createAccount({
      ...data,
      businessId,
    });
  }

  async getAccounts(businessId: string) {
    return this.accountingRepository.findAccounts(businessId);
  }

  /**
   * Record a transaction in the ledger and update account balance
   */
  async recordTransaction(businessId: string, userId: string, data: any) {
    const { accountId, debit, credit, description, reference } = data;

    const account = await this.accountingRepository.findAccountById(accountId, businessId);
    if (!account) {
      throw new AppError('Account not found', 404);
    }

    // Amount to change balance: debit increases asset/expense, credit increases liability/equity/revenue
    let netChange = 0;
    if (account.type === 'ASSET' || account.type === 'EXPENSE') {
      netChange = (debit || 0) - (credit || 0);
    } else {
      netChange = (credit || 0) - (debit || 0);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create ledger entry
      const entry = await tx.ledgerEntry.create({
        data: {
          businessId,
          accountId,
          userId,
          debit: debit || 0,
          credit: credit || 0,
          description,
          reference,
        },
      });

      // 2. Update account balance
      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            increment: netChange,
          },
        },
      });

      return entry;
    });
  }

  async getLedger(businessId: string, filter: any = {}) {
    return this.accountingRepository.findLedgerEntries(businessId, filter);
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
  async handleOrderCreated(payload: any) {
    const { orderId, businessId, total } = payload;

    const receivableAccount = await this.accountingRepository.findAccountBySystemType(businessId, 'RECEIVABLE');
    const revenueAccount = await this.accountingRepository.findAccountBySystemType(businessId, 'REVENUE');

    if (!receivableAccount || !revenueAccount) {
      console.warn(`[AccountingService] Skipping Order ${orderId}: Accounts not configured for business ${businessId}`);
      return;
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Debit Accounts Receivable
      await tx.ledgerEntry.create({
        data: {
          businessId,
          accountId: receivableAccount.id,
          debit: total,
          credit: 0,
          description: `Accounts Receivable for Order #${orderId}`,
          reference: orderId,
        },
      });

      await tx.account.update({
        where: { id: receivableAccount.id },
        data: { balance: { increment: total } },
      });

      // Credit Sales Revenue
      await tx.ledgerEntry.create({
        data: {
          businessId,
          accountId: revenueAccount.id,
          debit: 0,
          credit: total,
          description: `Sales Revenue for Order #${orderId}`,
          reference: orderId,
        },
      });

      await tx.account.update({
        where: { id: revenueAccount.id },
        data: { balance: { increment: total } }, // Revenue credit increases balance
      });
    });
  }

  /**
   * Automatic double-entry for completed payments
   * Debit: Cash/Bank (Asset)
   * Credit: Accounts Receivable (Asset)
   */
  async handlePaymentCompleted(payload: any) {
    const { orderId, businessId, amount, method } = payload;

    const cashAccount = await this.accountingRepository.findAccountBySystemType(businessId, 'CASH');
    const receivableAccount = await this.accountingRepository.findAccountBySystemType(businessId, 'RECEIVABLE');

    if (!cashAccount || !receivableAccount) {
      console.warn(`[AccountingService] Skipping Payment for Order ${orderId}: Accounts not configured`);
      return;
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Debit Cash/Bank
      await tx.ledgerEntry.create({
        data: {
          businessId,
          accountId: cashAccount.id,
          debit: amount,
          credit: 0,
          description: `Payment received via ${method} for Order #${orderId}`,
          reference: orderId,
        },
      });

      await tx.account.update({
        where: { id: cashAccount.id },
        data: { balance: { increment: amount } },
      });

      // Credit Accounts Receivable
      await tx.ledgerEntry.create({
        data: {
          businessId,
          accountId: receivableAccount.id,
          debit: 0,
          credit: amount,
          description: `Receivable cleared for Order #${orderId}`,
          reference: orderId,
        },
      });

      await tx.account.update({
        where: { id: receivableAccount.id },
        data: { balance: { decrement: amount } },
      });
    });
  }
}
