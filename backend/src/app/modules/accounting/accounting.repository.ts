import { PrismaClient } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class AccountingRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma as any;
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

  async createLedgerEntry(data: any) {
    return this.prisma.ledgerEntry.create({
      data,
      include: {
        account: true,
      },
    });
  }

  async findLedgerEntries(businessId: string, filter: any = {}) {
    return this.prisma.ledgerEntry.findMany({
      where: {
        businessId,
        ...filter,
      },
      include: {
        account: true,
        user: {
            select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateAccountBalance(id: string, businessId: string, amount: number) {
    return this.prisma.account.update({
      where: { id, businessId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async findAccountByCode(businessId: string, code: string) {
    return this.prisma.account.findFirst({
      where: { businessId, code },
    });
  }

  async findAccountBySystemType(businessId: string, type: string) {
    // This is a helper to find default accounts like 'RECEIVABLE', 'CASH', etc.
    // Assuming we have a way to tag them, or we use standard codes.
    return this.prisma.account.findFirst({
      where: { 
        businessId,
        OR: [
          { code: type },
          { name: { contains: type, mode: 'insensitive' } }
        ]
      },
    });
  }
}
