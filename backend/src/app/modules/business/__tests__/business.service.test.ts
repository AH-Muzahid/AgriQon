import { BusinessService } from '../business.service';
import { BusinessRepository } from '../business.repository';
import { prisma } from '../../../lib/prisma';
import { BusinessRole, PlatformRole } from '../../../../generated/client';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    $transaction: jest.fn(),
  },
}));

describe('BusinessService', () => {
  let businessService: BusinessService;
  let mockBusinessRepo: jest.Mocked<BusinessRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBusinessRepo = {} as any;
    businessService = new BusinessService(mockBusinessRepo);
  });

  describe('createBusiness', () => {
    it('should create a business, assign OWNER role, update user, setup accounts & warehouse in a single transaction', async () => {
      const mockTx = {
        business: {
          create: jest.fn().mockResolvedValue({ id: 'biz-123', name: 'AgriQon' }),
        },
        userBusinessRole: {
          create: jest.fn().mockResolvedValue({}),
        },
        user: {
          update: jest.fn().mockResolvedValue({}),
        },
        account: {
          upsert: jest.fn().mockResolvedValue({}),
        },
        warehouse: {
          create: jest.fn().mockResolvedValue({}),
        },
        subscription: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'sub-123' }),
        },
        subscriptionPlan: {
          findUnique: jest.fn().mockResolvedValue({ id: 'plan-123', code: 'TRIAL', name: 'Trial Plan' }),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({}),
        },
      };

      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback(mockTx);
      });

      const result = await businessService.createBusiness({
        name: 'AgriQon',
        organizationId: 'org-123',
        userId: 'user-123',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(mockTx.business.create).toHaveBeenCalled();
      expect(mockTx.userBusinessRole.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          businessId: 'biz-123',
          role: 'OWNER',
        },
      });
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { businessId: 'biz-123' },
      });
      expect(mockTx.account.upsert).toHaveBeenCalled();
      expect(mockTx.warehouse.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'biz-123', name: 'AgriQon' });
    });
  });
});
