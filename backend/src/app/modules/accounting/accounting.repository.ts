import { PrismaClient, ProcessingStatus, JournalStatus } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class AccountingRepository {
  private prisma: PrismaClient;

  constructor(tx?: any) {
    this.prisma = (tx || prisma) as PrismaClient;
  }

  async createAccount(data: any) {
    return this.prisma.account.create({
      data,
    });
  }

  async findAccounts(businessId: string) {
    return this.prisma.account.findMany({
      where: { businessId },
      orderBy: { name: 'asc' },
    });
  }

  async findAccountById(id: string, businessId: string) {
    return this.prisma.account.findUnique({
      where: { id, businessId },
    });
  }

  async findAccountByCode(businessId: string, code: string) {
    return this.prisma.account.findFirst({
      where: { businessId, code },
    });
  }

  async findAccountBySystemType(businessId: string, systemType: string) {
    // 1. Try exact match on systemType
    const exact = await this.prisma.account.findFirst({
      where: { businessId, systemType }
    });
    if (exact) return exact;

    // 2. Fallback to code or name (legacy/flexible)
    return this.prisma.account.findFirst({
      where: { 
        businessId,
        OR: [
          { code: systemType },
          { name: { contains: systemType, mode: 'insensitive' } }
        ]
      },
    });
  }

  async createJournalEntry(data: {
    businessId: string;
    description: string;
    reference?: string;
    source: string;
    status?: JournalStatus;
    eventId?: string;
    idempotencyKey?: string;
    currency?: string;
    exchangeRate?: number;
    lines: { accountId: string; debit: number; credit: number; description?: string }[];
  }) {
    const { lines, ...entryData } = data;
    
    // Calculate total debits and credits for balancing check
    const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.001;

    // Default status to DRAFT if not specified
    const status = entryData.status || JournalStatus.DRAFT;

    const entry = await this.prisma.journalEntry.create({
      data: {
        ...entryData,
        isBalanced,
        status,
        lines: {
          create: lines,
        },
      },
      include: { lines: true },
    });

    if (entry.status === JournalStatus.POSTED) {
      await this.updateAccountBalances(this.prisma, lines);
    }

    return entry;

  }

  private async updateAccountBalances(tx: any, lines: any[]) {
    for (const line of lines) {
      const account = await tx.account.findUnique({ where: { id: line.accountId } });
      if (!account) throw new Error(`Account ${line.accountId} not found`);

      let netChange = 0;
      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        netChange = line.debit - line.credit;
      } else {
        netChange = line.credit - line.debit;
      }

      await tx.account.update({
        where: { id: line.accountId },
        data: { balance: { increment: netChange } }
      });
    }
  }

  async postJournalEntry(id: string, businessId: string, userId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const entry = await tx.journalEntry.findUnique({
        where: { id, businessId },
        include: { lines: true }
      });

      if (!entry) throw new Error('Journal Entry not found');
      if (entry.status === 'POSTED') throw new Error('Journal Entry already posted');
      if (!entry.isBalanced) throw new Error('Cannot post unbalanced journal entry');

      // 1. Update status
      const updatedEntry = await tx.journalEntry.update({
        where: { id },
        data: {
          status: 'POSTED',
          postedAt: new Date(),
          postedById: userId
        }
      });

      // 2. Update balances
      await this.updateAccountBalances(tx, entry.lines);

      return updatedEntry;
    });
  }

  async findJournalEntryByEventId(eventId: string) {
    return this.prisma.journalEntry.findUnique({
      where: { eventId }
    });
  }

  async findJournalEntryByIdempotencyKey(idempotencyKey: string) {
    return this.prisma.journalEntry.findUnique({
      where: { idempotencyKey }
    });
  }

  async findJournalEntries(businessId: string, filter: any = {}) {
    return this.prisma.journalEntry.findMany({
      where: { businessId, ...filter },
      include: { lines: { include: { account: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Find or create a system account by its unique type
   */
  async getOrCreateSystemAccount(businessId: string, systemType: string, defaultData: { name: string; code: string; type: any }) {
    return this.prisma.account.upsert({
      where: {
        systemType_businessId: {
          systemType,
          businessId
        }
      },
      update: {}, // Don't update if exists
      create: {
        ...defaultData,
        businessId,
        systemType
      }
    });
  }

  async findLedgerEntries(businessId: string, filter: any = {}) {
    // We now return JournalLines from POSTED JournalEntries
    return this.prisma.journalLine.findMany({
      where: {
        journalEntry: {
          businessId,
          status: 'POSTED',
          ...filter.journalEntry
        },
        ...filter.journalLine
      },
      include: {
        account: true,
        journalEntry: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }


  async createWebhookEvent(data: { 
    provider: string; 
    externalId?: string; 
    payload: any; 
    businessId?: string 
  }) {
    return this.prisma.webhookEvent.create({
      data
    });
  }

  async findWebhookEvent(provider: string, externalId: string) {
    return this.prisma.webhookEvent.findUnique({
      where: { externalId } // externalId is unique in our schema
    });
  }

  async updateWebhookStatus(id: string, status: ProcessingStatus, error?: string) {
    return this.prisma.webhookEvent.update({
      where: { id },
      data: { 
        status, 
        lastError: error, 
        processedAt: status === ProcessingStatus.PROCESSED ? new Date() : undefined,
        processingAt: status === ProcessingStatus.PROCESSING ? new Date() : undefined
      }
    });
  }
}
