import { InventoryService } from '../inventory.service';
import { InventoryRepository } from '../inventory.repository';
import { AppError } from '../../../errors/AppError';
import { MovementType, Prisma } from '../../../../generated/client';

jest.mock('../inventory.repository');

const mockInventoryBase = {
  id: 'inv-1',
  businessId: 'bus-1',
  itemId: 'item-1',
  warehouseId: 'wh-1',
  batchId: null,
  availableStock: 100,
  reservedStock: 0,
  totalStock: 100,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('InventoryService', () => {
  let inventoryService: InventoryService;
  let mockRepo: jest.Mocked<InventoryRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
      findByProductAndWarehouse: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMovement: jest.fn(),
      updateWithOptimisticLock: jest.fn(),
    } as unknown as jest.Mocked<InventoryRepository>;

    (InventoryRepository as jest.Mock).mockImplementation(() => mockRepo);

    inventoryService = new InventoryService(mockRepo);
  });

  describe('adjustStock', () => {
    const baseParams = {
      businessId: 'bus-1',
      itemId: 'item-1',
      warehouseId: 'wh-1',
      quantity: 10,
      type: MovementType.IN,
    };

    it('should find existing inventory, create a movement, and update stock', async () => {
      mockRepo.findByProductAndWarehouse.mockResolvedValue(mockInventoryBase);
      mockRepo.createMovement.mockResolvedValue({} as any);
      mockRepo.updateWithOptimisticLock.mockResolvedValue({
        ...mockInventoryBase,
        availableStock: 110,
        version: 2,
      });

      const result = await inventoryService.adjustStock(baseParams);

      expect(mockRepo.findByProductAndWarehouse).toHaveBeenCalledWith({
        businessId: 'bus-1',
        itemId: 'item-1',
        warehouseId: 'wh-1',
      });
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.createMovement).toHaveBeenCalledWith({
        businessId: 'bus-1',
        inventoryId: 'inv-1',
        type: MovementType.IN,
        quantity: 10,
        reason: undefined,
        reference: undefined,
      });
      expect(mockRepo.updateWithOptimisticLock).toHaveBeenCalledWith({
        id: 'inv-1',
        businessId: 'bus-1',
        availableStock: 110, // 100 + 10
        version: 1,
      });
      expect(result.availableStock).toBe(110);
    });

    it('should lazily create inventory record if it does not exist', async () => {
      // Rule: Lazy Initialization — no inventory row → create it with 0 stock
      mockRepo.findByProductAndWarehouse.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ ...mockInventoryBase, availableStock: 0 });
      mockRepo.createMovement.mockResolvedValue({} as any);
      mockRepo.updateWithOptimisticLock.mockResolvedValue({
        ...mockInventoryBase,
        availableStock: 10,
        version: 2,
      });

      await inventoryService.adjustStock(baseParams);

      expect(mockRepo.create).toHaveBeenCalledWith({
        businessId: 'bus-1',
        itemId: 'item-1',
        warehouseId: 'wh-1',
        availableStock: 0,
        totalStock: 0,
      });
      expect(mockRepo.updateWithOptimisticLock).toHaveBeenCalledWith(
        expect.objectContaining({ availableStock: 10 }) // 0 + 10
      );
    });

    it('should throw AppError 400 when resulting stock would go negative', async () => {
      // Rule: Never allow negative stock
      mockRepo.findByProductAndWarehouse.mockResolvedValue({
        ...mockInventoryBase,
        availableStock: 5, // only 5 in stock
      });
      mockRepo.createMovement.mockResolvedValue({} as any);

      await expect(
        inventoryService.adjustStock({ ...baseParams, quantity: -10, type: MovementType.OUT })
      ).rejects.toThrow(new AppError('Insufficient stock for this operation', 400));

      // updateWithOptimisticLock must NOT be called when stock check fails
      expect(mockRepo.updateWithOptimisticLock).not.toHaveBeenCalled();
    });

    it('should throw AppError 409 on optimistic locking conflict (P2025)', async () => {
      // Rule 11: Optimistic locking — concurrent modification detected
      mockRepo.findByProductAndWarehouse.mockResolvedValue(mockInventoryBase);
      mockRepo.createMovement.mockResolvedValue({} as any);

      const prismaConflictError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found.',
        { code: 'P2025', clientVersion: '5.0.0' }
      );
      mockRepo.updateWithOptimisticLock.mockRejectedValue(prismaConflictError);

      await expect(inventoryService.adjustStock(baseParams)).rejects.toThrow(
        new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409)
      );
    });

    it('should re-throw unknown errors from updateWithOptimisticLock', async () => {
      mockRepo.findByProductAndWarehouse.mockResolvedValue(mockInventoryBase);
      mockRepo.createMovement.mockResolvedValue({} as any);

      const unknownError = new Error('Database connection lost');
      mockRepo.updateWithOptimisticLock.mockRejectedValue(unknownError);

      await expect(inventoryService.adjustStock(baseParams)).rejects.toThrow(
        'Database connection lost'
      );
    });
  });

  describe('getInventory', () => {
    it('should delegate to inventoryRepo.findMany with provided params', async () => {
      const mockItems = [{ ...mockInventoryBase, item: {}, warehouse: {}, batch: null }];
      mockRepo.findMany.mockResolvedValue(mockItems as any);

      const result = await inventoryService.getInventory({
        businessId: 'bus-1',
        itemId: 'item-1',
        warehouseId: 'wh-1',
      });

      expect(mockRepo.findMany).toHaveBeenCalledWith({
        businessId: 'bus-1',
        itemId: 'item-1',
        warehouseId: 'wh-1',
      });
      expect(result).toEqual(mockItems);
    });
  });
});
