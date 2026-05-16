import { AccountingService } from '../accounting.service';
import { AccountingRepository } from '../accounting.repository';
import { AuditService } from '../../audit/audit.service';

jest.mock('../accounting.repository');
jest.mock('../../audit/audit.service');
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    journalLine: {
      aggregate: jest.fn()
    }
  }
}));

describe('AccountingService', () => {
  let accountingService: AccountingService;
  let mockRepo: jest.Mocked<AccountingRepository>;
  let mockAudit: jest.Mocked<AuditService>;

  beforeEach(() => {
    accountingService = new AccountingService();
    mockRepo = (accountingService as any).accountingRepository;
    mockAudit = (accountingService as any).auditService;

    // Default mocks to prevent boilerplate and undefined errors
    mockRepo.findJournalEntryByEventId.mockResolvedValue(null);
    mockRepo.createJournalEntry.mockImplementation(async (data: any) => ({
      id: 'je_mock_' + Math.random().toString(36).substr(2, 9),
      ...data,
      lines: data.lines.map((l: any, i: number) => ({ id: `line_${i}`, ...l }))
    }));
  });

  describe('handlePaymentRefunded', () => {
    it('should create a journal entry for refund (Returns Debit, Cash Credit)', async () => {
      const payload = {
        paymentId: 'pay_1',
        orderId: 'order_1',
        businessId: 'biz_1',
        amount: 100,
        reason: 'Faulty item',
      };

      const mockReturnsAccount = { id: 'acc_returns', type: 'EXPENSE' };
      const mockCashAccount = { id: 'acc_cash', type: 'ASSET' };

      mockRepo.getOrCreateSystemAccount.mockImplementation((bizId, type) => {
        if (type === 'RETURNS') return Promise.resolve(mockReturnsAccount as any);
        if (type === 'CASH') return Promise.resolve(mockCashAccount as any);
        return Promise.resolve(null);
      });

      const mockEntry = { id: 'je_1' };
      mockRepo.createJournalEntry.mockResolvedValue(mockEntry as any);

      await accountingService.handlePaymentRefunded(payload);

      expect(mockRepo.createJournalEntry).toHaveBeenCalledWith({
        businessId: 'biz_1',
        description: 'Refund for Order #order_1: Faulty item',
        reference: 'pay_1',
        source: 'REFUND',
        status: 'POSTED',
        lines: [
          {
            accountId: 'acc_returns',
            debit: 100,
            credit: 0,
            description: 'Sales Return/Refund'
          },
          {
            accountId: 'acc_cash',
            debit: 0,
            credit: 100,
            description: 'Cash refunded'
          }
        ]
      });

      expect(mockAudit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'JOURNAL_ENTRY_REFUND',
        entityId: 'je_1'
      }));
    });
  });

  describe('handleInventoryDeducted', () => {
    it('should create a journal entry for COGS (COGS Debit, Inventory Credit)', async () => {
      const payload = {
        businessId: 'biz_1',
        itemId: 'item_1',
        orderId: 'order_1',
        quantity: 2,
        costPrice: 50,
      };

      const mockCogsAccount = { id: 'acc_cogs' };
      const mockInventoryAccount = { id: 'acc_inv' };

      mockRepo.getOrCreateSystemAccount.mockImplementation((bizId, type) => {
        if (type === 'COGS') return Promise.resolve(mockCogsAccount as any);
        if (type === 'INVENTORY') return Promise.resolve(mockInventoryAccount as any);
        return Promise.resolve(null);
      });

      const mockEntry = { id: 'je_2' };
      mockRepo.createJournalEntry.mockResolvedValue(mockEntry as any);

      await accountingService.handleInventoryDeducted(payload);

      expect(mockRepo.createJournalEntry).toHaveBeenCalledWith({
        businessId: 'biz_1',
        description: 'COGS Recognition for Order #order_1 - Item item_1',
        reference: 'order_1',
        source: 'INVENTORY',
        eventId: 'COGS_order_1_item_1',
        status: 'POSTED',
        lines: [
          {
            accountId: 'acc_cogs',
            debit: 100,
            credit: 0,
            description: 'Cost of Goods Sold (2 units)'
          },
          {
            accountId: 'acc_inv',
            debit: 0,
            credit: 100,
            description: 'Inventory reduction'
          }
        ]
      });
    });
  });

  describe('handleOrderCreated', () => {
    it('should create a journal entry for order (Receivable Debit, Sales Credit, Tax Credit)', async () => {
      const payload = {
        orderId: 'order_1',
        businessId: 'biz_1',
        total: 115,
        subtotal: 100,
        taxAmount: 15,
      };

      const mockAccounts = {
        RECEIVABLE: { id: 'acc_ar' },
        REVENUE: { id: 'acc_sales' },
        TAX_PAYABLE: { id: 'acc_tax' }
      };

      mockRepo.getOrCreateSystemAccount.mockImplementation((bizId, type) => 
        Promise.resolve((mockAccounts as any)[type])
      );

      await accountingService.handleOrderCreated(payload as any);

      expect(mockRepo.createJournalEntry).toHaveBeenCalledWith({
        businessId: 'biz_1',
        description: 'Order #order_1 - Sales Recognition',
        reference: 'order_1',
        source: 'SALES',
        eventId: 'order_1',
        status: 'POSTED',
        lines: [
          {
            accountId: 'acc_ar',
            debit: 115,
            credit: 0,
            description: 'Accounts Receivable for Order #order_1'
          },
          {
            accountId: 'acc_sales',
            debit: 0,
            credit: 100,
            description: 'Sales Revenue (excl. tax) for Order #order_1'
          },
          {
            accountId: 'acc_tax',
            debit: 0,
            credit: 15,
            description: 'Sales Tax Liability for Order #order_1'
          }
        ]
      });
    });
  });

  describe('handlePaymentCompleted', () => {
    it('should create a journal entry for payment (Cash Debit, Receivable Credit)', async () => {
      const payload = {
        paymentId: 'pay_1',
        orderId: 'order_1',
        businessId: 'biz_1',
        amount: 115,
        method: 'SSLCOMMERZ'
      };

      const mockAccounts = {
        CASH: { id: 'acc_cash' },
        RECEIVABLE: { id: 'acc_ar' }
      };

      mockRepo.getOrCreateSystemAccount.mockImplementation((bizId, type) => 
        Promise.resolve((mockAccounts as any)[type])
      );

      await accountingService.handlePaymentCompleted(payload as any);

      expect(mockRepo.createJournalEntry).toHaveBeenCalledWith({
        businessId: 'biz_1',
        description: 'Payment for Order #order_1 via SSLCOMMERZ',
        reference: 'order_1',
        source: 'PAYMENT',
        eventId: 'PAYMENT_order_1',
        status: 'POSTED',
        lines: [
          {
            accountId: 'acc_cash',
            debit: 115,
            credit: 0,
            description: 'Cash received via SSLCOMMERZ'
          },
          {
            accountId: 'acc_ar',
            debit: 0,
            credit: 115,
            description: 'Receivable cleared'
          }
        ]
      });
    });
  });

  describe('reconcileBalances', () => {
    it('should return reconciliation results comparing account balance vs journal lines', async () => {
      const businessId = 'biz_1';
      const mockAccounts = [
        { id: 'acc_1', name: 'Cash', balance: 100, type: 'ASSET' },
        { id: 'acc_2', name: 'Sales', balance: 50, type: 'REVENUE' }
      ];

      mockRepo.findAccounts.mockResolvedValue(mockAccounts as any);
      
      const { prisma } = require('../../../lib/prisma');
      prisma.journalLine.aggregate.mockImplementation(({ where }: any) => {
        if (where.accountId === 'acc_1') {
          return Promise.resolve({ _sum: { debit: 100, credit: 0 } });
        }
        if (where.accountId === 'acc_2') {
          return Promise.resolve({ _sum: { debit: 0, credit: 50 } });
        }
        return Promise.resolve({ _sum: { debit: 0, credit: 0 } });
      });

      const result = await accountingService.reconcileBalances(businessId);

      expect(result.isSystemHealthy).toBe(true);
      expect(result.details).toHaveLength(2);
      expect(result.details[0].isReconciled).toBe(true);
    });
  });
});
