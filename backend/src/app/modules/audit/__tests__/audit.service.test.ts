import { AuditService } from '../audit.service';
import { AuditRepository } from '../audit.repository';

jest.mock('../audit.repository');

describe('AuditService', () => {
  let auditService: AuditService;
  let mockAuditRepository: jest.Mocked<AuditRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockAuditRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<AuditRepository>;

    // Override the repository initialization
    (AuditRepository as jest.Mock).mockImplementation(() => mockAuditRepository);

    auditService = new AuditService();
  });

  describe('log', () => {
    it('should call auditRepository.create with correct parameters', async () => {
      const mockParams = {
        businessId: 'bus-1',
        action: 'UPDATE',
        entityType: 'INVOICE',
        entityId: 'inv-1',
        newData: { status: 'PAID' }
      };

      mockAuditRepository.create.mockResolvedValue({
        id: 'log-1',
        ...mockParams,
        userId: null,
        previousData: null,
        changedFields: null,
        createdAt: new Date(),
        ipAddress: null,
        userAgent: null
      } as any);

      await auditService.log(mockParams);

      expect(AuditRepository).toHaveBeenCalledTimes(1); // Standard init
      expect(mockAuditRepository.create).toHaveBeenCalledWith({
        businessId: 'bus-1',
        userId: undefined,
        action: 'UPDATE',
        entityType: 'INVOICE',
        entityId: 'inv-1',
        previousData: expect.anything(), // Prisma.JsonNull sentinel
        newData: { status: 'PAID' },
        changedFields: expect.anything(), // Prisma.JsonNull sentinel
      });
    });

    it('should use transaction client if provided', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockTx = {} as any; // acts as a Prisma.TransactionClient
      const mockTxRepo = { create: jest.fn() } as unknown as jest.Mocked<AuditRepository>;
      
      // When AuditRepository is instantiated with mockTx, return mockTxRepo
      (AuditRepository as jest.Mock).mockImplementation((tx) => {
        if (tx === mockTx) return mockTxRepo;
        return mockAuditRepository;
      });

      const mockParams = {
        businessId: 'bus-1',
        action: 'CREATE',
        entityType: 'PRODUCT',
        entityId: 'prod-1',
        tx: mockTx
      };

      await auditService.log(mockParams);

      expect(AuditRepository).toHaveBeenCalledWith(mockTx);
      expect(mockTxRepo.create).toHaveBeenCalled();
    });
  });

  describe('getAuditLogs', () => {
    it('should calculate skip and take correctly and return paginated result', async () => {
      const mockItems = [{ id: 'log-1', action: 'CREATE' }];
      mockAuditRepository.findAll.mockResolvedValue({
        items: mockItems as any,
        total: 10
      });

      const result = await auditService.getAuditLogs({
        businessId: 'bus-1',
        page: 2,
        limit: 5
      });

      expect(mockAuditRepository.findAll).toHaveBeenCalledWith({
        businessId: 'bus-1',
        page: 2,
        limit: 5,
        skip: 5, // (2 - 1) * 5
        take: 5
      });

      expect(result).toEqual({
        items: mockItems,
        meta: {
          page: 2,
          limit: 5,
          total: 10
        }
      });
    });
  });
});
