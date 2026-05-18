import { InventoryService } from '../inventory.service';
import { InventoryRepository } from '../inventory.repository';
import { AppError } from '../../../errors/AppError';
import { MovementType, Prisma } from '../../../../generated/client';
import { ValuationService } from '../valuation.service';
import { AuditService } from '../../audit/audit.service';
import { prisma } from '../../../lib/prisma';

jest.mock('../inventory.repository');
jest.mock('../valuation.service');
jest.mock('../../audit/audit.service');
jest.mock('../alert.service');
jest.mock('../../../lib/prisma', () => {
  const mockPrisma: any = {
    item: {
      findUnique: jest.fn(),
    },
    outboxEvent: {
      create: jest.fn(),
    },
    stockReservation: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mockPrisma)),
  };
  return { prisma: mockPrisma };
});

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
      updateStockFields: jest.fn(),
      findReservationById: jest.fn(),
      deleteReservation: jest.fn(),
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
      mockRepo.updateStockFields.mockResolvedValue({
        ...mockInventoryBase,
        availableStock: 110,
        totalStock: 110,
        version: 2,
      });

      const result = await inventoryService.adjustStock(baseParams);

      expect(mockRepo.findByProductAndWarehouse).toHaveBeenCalledWith({
        businessId: 'bus-1',
        itemId: 'item-1',
        warehouseId: 'wh-1',
        batchId: undefined,
      });
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(mockRepo.createMovement).toHaveBeenCalledWith({
        businessId: 'bus-1',
        inventoryId: 'inv-1',
        itemId: 'item-1',
        type: MovementType.IN,
        quantity: 10,
        reason: undefined,
        reference: undefined,
        unitCost: undefined,
      });
      expect(mockRepo.updateStockFields).toHaveBeenCalledWith({
        id: 'inv-1',
        businessId: 'bus-1',
        availableDelta: 10,
        totalDelta: 10,
        version: 1,
      });
      expect(result.availableStock).toBe(110);
    });

    it('should lazily create inventory record if it does not exist', async () => {
      // Rule: Lazy Initialization — no inventory row → create it with 0 stock
      mockRepo.findByProductAndWarehouse.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({ ...mockInventoryBase, availableStock: 0, totalStock: 0 });
      mockRepo.createMovement.mockResolvedValue({} as any);
      mockRepo.updateStockFields.mockResolvedValue({
        ...mockInventoryBase,
        availableStock: 10,
        totalStock: 10,
        version: 2,
      });

      await inventoryService.adjustStock(baseParams);

      expect(mockRepo.create).toHaveBeenCalledWith({
        businessId: 'bus-1',
        itemId: 'item-1',
        warehouseId: 'wh-1',
        batchId: undefined,
        availableStock: 0,
        totalStock: 0,
      });
      expect(mockRepo.updateStockFields).toHaveBeenCalledWith(
        expect.objectContaining({ availableDelta: 10 }) // 0 + 10
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

      // updateStockFields must NOT be called when stock check fails
      expect(mockRepo.updateStockFields).not.toHaveBeenCalled();
    });

    it('should throw AppError 409 on optimistic locking conflict (P2025)', async () => {
      // Rule 11: Optimistic locking — concurrent modification detected
      mockRepo.findByProductAndWarehouse.mockResolvedValue(mockInventoryBase);
      mockRepo.createMovement.mockResolvedValue({} as any);

      const prismaConflictError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found.',
        { code: 'P2025', clientVersion: '5.0.0' }
      );
      mockRepo.updateStockFields.mockRejectedValue(prismaConflictError);

      await expect(inventoryService.adjustStock(baseParams)).rejects.toThrow(
        new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409)
      );
    });

    it('should re-throw unknown errors from updateStockFields', async () => {
      mockRepo.findByProductAndWarehouse.mockResolvedValue(mockInventoryBase);
      mockRepo.createMovement.mockResolvedValue({} as any);

      const unknownError = new Error('Database connection lost');
      mockRepo.updateStockFields.mockRejectedValue(unknownError);

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

  describe('reserveStock', () => {
    const baseItems = [
      { itemId: 'item-1', warehouseId: 'wh-1', quantity: 5 }
    ];

    it('should reserve stock and create reservation record', async () => {
      mockRepo.findByProductAndWarehouse.mockResolvedValue(mockInventoryBase);
      mockRepo.updateStockFields.mockResolvedValue({
        ...mockInventoryBase,
        availableStock: 95,
        reservedStock: 5,
        version: 2,
      });
      (prisma.stockReservation.create as jest.Mock).mockResolvedValue({} as any);

      await inventoryService.reserveStock({
        businessId: 'bus-1',
        orderId: 'order-1',
        items: baseItems,
      });

      expect(mockRepo.findByProductAndWarehouse).toHaveBeenCalledWith({
        businessId: 'bus-1',
        itemId: 'item-1',
        warehouseId: 'wh-1',
      });
      expect(mockRepo.updateStockFields).toHaveBeenCalledWith({
        id: 'inv-1',
        businessId: 'bus-1',
        availableDelta: -5,
        reservedDelta: 5,
        version: 1,
      });
      expect(prisma.stockReservation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          businessId: 'bus-1',
          inventoryId: 'inv-1',
          orderId: 'order-1',
          quantity: 5,
        }),
      });
      expect(prisma.outboxEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'domain.inventory.reserved',
            businessId: 'bus-1',
            aggregateType: 'Order',
            aggregateId: 'order-1',
          }),
        })
      );
    });

    it('should combine multiple requests for the same item + warehouse to prevent lock conflicts', async () => {
      const duplicateItems = [
        { itemId: 'item-1', warehouseId: 'wh-1', quantity: 5 },
        { itemId: 'item-1', warehouseId: 'wh-1', quantity: 3 }
      ];

      mockRepo.findByProductAndWarehouse.mockResolvedValue(mockInventoryBase);
      mockRepo.updateStockFields.mockResolvedValue({
        ...mockInventoryBase,
        availableStock: 92,
        reservedStock: 8,
        version: 2,
      });
      (prisma.stockReservation.create as jest.Mock).mockResolvedValue({} as any);

      await inventoryService.reserveStock({
        businessId: 'bus-1',
        orderId: 'order-1',
        items: duplicateItems,
      });

      // findByProductAndWarehouse should be called once, because the items are grouped
      expect(mockRepo.findByProductAndWarehouse).toHaveBeenCalledTimes(1);
      expect(mockRepo.updateStockFields).toHaveBeenCalledWith({
        id: 'inv-1',
        businessId: 'bus-1',
        availableDelta: -8,
        reservedDelta: 8,
        version: 1,
      });
    });

    it('should throw AppError 400 when insufficient available stock', async () => {
      mockRepo.findByProductAndWarehouse.mockResolvedValue({
        ...mockInventoryBase,
        availableStock: 3, // less than 5 requested
      });

      await expect(
        inventoryService.reserveStock({
          businessId: 'bus-1',
          orderId: 'order-1',
          items: baseItems,
        })
      ).rejects.toThrow(
        new AppError('Insufficient stock for item: item-1. Available: 3, Requested: 5', 400)
      );

      expect(mockRepo.updateStockFields).not.toHaveBeenCalled();
      expect(prisma.stockReservation.create).not.toHaveBeenCalled();
    });

    it('should throw AppError 409 on optimistic locking conflict (P2025)', async () => {
      mockRepo.findByProductAndWarehouse.mockResolvedValue(mockInventoryBase);

      const prismaConflictError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found.',
        { code: 'P2025', clientVersion: '5.0.0' }
      );
      mockRepo.updateStockFields.mockRejectedValue(prismaConflictError);

      await expect(
        inventoryService.reserveStock({
          businessId: 'bus-1',
          orderId: 'order-1',
          items: baseItems,
        })
      ).rejects.toThrow(
        new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409)
      );
    });
  });

  describe('releaseOrderReservations', () => {
    it('should return early when no reservations found', async () => {
      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue([]);

      await inventoryService.releaseOrderReservations('order-1', 'bus-1');

      expect(mockRepo.updateStockFields).not.toHaveBeenCalled();
      expect(prisma.stockReservation.deleteMany).not.toHaveBeenCalled();
    });

    it('should group reservations by inventory and release stock', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          inventoryId: 'inv-1',
          quantity: 5,
          inventory: { version: 1 }
        },
        {
          id: 'res-2',
          inventoryId: 'inv-1',
          quantity: 3,
          inventory: { version: 1 }
        }
      ];

      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue(mockReservations);
      mockRepo.updateStockFields.mockResolvedValue({} as any);
      (prisma.stockReservation.deleteMany as jest.Mock).mockResolvedValue({} as any);

      await inventoryService.releaseOrderReservations('order-1', 'bus-1');

      expect(mockRepo.updateStockFields).toHaveBeenCalledWith({
        id: 'inv-1',
        businessId: 'bus-1',
        availableDelta: 8,
        reservedDelta: -8,
        version: 1,
      });

      expect(prisma.stockReservation.deleteMany).toHaveBeenCalledWith({
        where: { orderId: 'order-1', businessId: 'bus-1' }
      });
      expect(prisma.outboxEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'domain.inventory.released',
            businessId: 'bus-1',
            aggregateType: 'Order',
            aggregateId: 'order-1',
          })
        })
      );
    });

    it('should throw AppError 409 on optimistic locking conflict (P2025)', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          inventoryId: 'inv-1',
          quantity: 5,
          inventory: { version: 1 }
        }
      ];

      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue(mockReservations);
      const prismaConflictError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found.',
        { code: 'P2025', clientVersion: '5.0.0' }
      );
      mockRepo.updateStockFields.mockRejectedValue(prismaConflictError);

      await expect(
        inventoryService.releaseOrderReservations('order-1', 'bus-1')
      ).rejects.toThrow(
        new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409)
      );
    });
  });

  describe('releaseReservation', () => {
    it('should return early when reservation not found', async () => {
      mockRepo.findReservationById.mockResolvedValue(null);

      await inventoryService.releaseReservation('res-1', 'bus-1');

      expect(mockRepo.updateStockFields).not.toHaveBeenCalled();
      expect(mockRepo.deleteReservation).not.toHaveBeenCalled();
    });

    it('should release stock and delete reservation', async () => {
      const mockReservation = {
        id: 'res-1',
        inventoryId: 'inv-1',
        orderId: 'order-1',
        quantity: 5,
        inventory: { version: 1 }
      };

      mockRepo.findReservationById.mockResolvedValue(mockReservation as any);
      mockRepo.updateStockFields.mockResolvedValue({} as any);
      mockRepo.deleteReservation.mockResolvedValue({} as any);

      await inventoryService.releaseReservation('res-1', 'bus-1');

      expect(mockRepo.updateStockFields).toHaveBeenCalledWith({
        id: 'inv-1',
        businessId: 'bus-1',
        availableDelta: 5,
        reservedDelta: -5,
        version: 1,
      });
      expect(mockRepo.deleteReservation).toHaveBeenCalledWith('res-1');
      expect(prisma.outboxEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'domain.inventory.released',
            businessId: 'bus-1',
            aggregateType: 'Inventory',
            aggregateId: 'inv-1',
          })
        })
      );
    });

    it('should throw AppError 409 on optimistic locking conflict (P2025)', async () => {
      const mockReservation = {
        id: 'res-1',
        inventoryId: 'inv-1',
        orderId: 'order-1',
        quantity: 5,
        inventory: { version: 1 }
      };

      mockRepo.findReservationById.mockResolvedValue(mockReservation as any);
      const prismaConflictError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found.',
        { code: 'P2025', clientVersion: '5.0.0' }
      );
      mockRepo.updateStockFields.mockRejectedValue(prismaConflictError);

      await expect(
        inventoryService.releaseReservation('res-1', 'bus-1')
      ).rejects.toThrow(
        new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409)
      );
    });
  });

  describe('confirmStockReservation', () => {
    it('should finalize stock deduction and create deduction events', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          inventoryId: 'inv-1',
          quantity: 5,
          inventory: {
            version: 1,
            itemId: 'item-1'
          }
        }
      ];

      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue(mockReservations);
      mockRepo.updateStockFields.mockResolvedValue({} as any);
      (prisma.stockReservation.deleteMany as jest.Mock).mockResolvedValue({} as any);
      (prisma.item.findUnique as jest.Mock).mockResolvedValue({ costPrice: 100 });

      await inventoryService.confirmStockReservation('order-1', 'bus-1');

      expect(mockRepo.updateStockFields).toHaveBeenCalledWith({
        id: 'inv-1',
        businessId: 'bus-1',
        reservedDelta: -5,
        totalDelta: -5,
        version: 1,
      });

      expect(prisma.stockReservation.deleteMany).toHaveBeenCalledWith({
        where: { orderId: 'order-1', businessId: 'bus-1' }
      });

      expect(prisma.item.findUnique).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        select: { costPrice: true }
      });

      expect(prisma.outboxEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventType: 'domain.inventory.deducted',
            businessId: 'bus-1',
            aggregateType: 'Inventory',
            aggregateId: 'inv-1',
          })
        })
      );
    });

    it('should throw AppError 409 on optimistic locking conflict (P2025)', async () => {
      const mockReservations = [
        {
          id: 'res-1',
          inventoryId: 'inv-1',
          quantity: 5,
          inventory: {
            version: 1,
            itemId: 'item-1'
          }
        }
      ];

      (prisma.stockReservation.findMany as jest.Mock).mockResolvedValue(mockReservations);
      const prismaConflictError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found.',
        { code: 'P2025', clientVersion: '5.0.0' }
      );
      mockRepo.updateStockFields.mockRejectedValue(prismaConflictError);

      await expect(
        inventoryService.confirmStockReservation('order-1', 'bus-1')
      ).rejects.toThrow(
        new AppError('Concurrency error: Stock was modified by another process. Please retry.', 409)
      );
    });
  });
});
