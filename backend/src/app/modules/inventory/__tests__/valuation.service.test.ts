import { ValuationService } from '../valuation.service';
import { prisma } from '../../../lib/prisma';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    item: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    inventoryValuation: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('ValuationService', () => {
  let valuationService: ValuationService;

  beforeEach(() => {
    jest.clearAllMocks();
    valuationService = new ValuationService();
  });

  describe('updateWAC', () => {
    const params = {
      businessId: 'bus-1',
      itemId: 'item-1',
      addedQuantity: 10,
      unitCost: 100,
    };

    it('should calculate new WAC correctly when stock is added', async () => {
      // Existing: 10 units @ $50 = $500
      // New: 10 units @ $100 = $1000
      // Total: 20 units @ ($500 + $1000)/20 = $75
      (prisma.item.findFirst as jest.Mock).mockResolvedValue({
        id: 'item-1',
        costPrice: 50,
        inventory: [{ totalStock: 10, availableStock: 10 }],
      });

      const result = await valuationService.updateWAC(params);

      expect(result.newWAC).toBe(75);
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { id: 'item-1' },
        data: { costPrice: 75 },
      });
      expect(prisma.inventoryValuation.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          unitCost: 75,
          quantity: 20,
          totalValue: 1500,
        }),
      }));
    });

    it('should set new WAC to unitCost if existing stock is zero', async () => {
      (prisma.item.findFirst as jest.Mock).mockResolvedValue({
        id: 'item-1',
        costPrice: 0,
        inventory: [{ totalStock: 0, availableStock: 0 }],
      });

      const result = await valuationService.updateWAC(params);

      expect(result.newWAC).toBe(100);
    });

    it('should throw error if item not found', async () => {
      (prisma.item.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(valuationService.updateWAC(params)).rejects.toThrow('Item item-1 not found');
    });
  });

  describe('recordSnapshot', () => {
    it('should create a valuation record without updating item cost', async () => {
      await valuationService.recordSnapshot({
        businessId: 'bus-1',
        itemId: 'item-1',
        quantity: 50,
        unitCost: 75,
      });

      expect(prisma.inventoryValuation.create).toHaveBeenCalledWith({
        data: {
          businessId: 'bus-1',
          itemId: 'item-1',
          quantity: 50,
          unitCost: 75,
          totalValue: 3750,
          method: 'WAC',
          reference: undefined,
        },
      });
      expect(prisma.item.update).not.toHaveBeenCalled();
    });
  });
});
