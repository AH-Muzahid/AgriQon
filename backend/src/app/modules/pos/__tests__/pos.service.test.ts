import { PosService } from '../pos.service';
import { OrderService } from '../../orders/order.service';
import { AppError } from '../../../errors/AppError';
import { OrderStatus } from '../../../../generated/client';

// Mock raw prisma client
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    item: {
      findMany: jest.fn(),
    },
    warehouse: {
      findFirst: jest.fn(),
    },
    payment: {
      create: jest.fn(),
    },
    order: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    invoice: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    outboxEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(prisma)),
  },
}));

import { prisma } from '../../../lib/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('PosService', () => {
  let posService: PosService;
  let mockOrderService: jest.Mocked<OrderService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOrderService = {
      createOrder: jest.fn(),
    } as unknown as jest.Mocked<OrderService>;

    posService = new PosService(mockOrderService);

    // Mock transaction behavior to execute callback directly with mockPrisma
    mockPrisma.$transaction.mockImplementation(async (cb: any) => {
      return await cb(mockPrisma);
    });
    (mockPrisma.payment.create as jest.Mock).mockResolvedValue({ id: 'payment-1' });
  });

  describe('calculateSummary', () => {
    it('should calculate metrics correctly for valid items', async () => {
      const mockDbItems = [
        { id: 'item-1', price: new Prisma.Decimal(100), businessId: 'bus-1', title: 'Product 1' },
        { id: 'item-2', price: new Prisma.Decimal(200), businessId: 'bus-1', title: 'Product 2' },
      ];
      (mockPrisma.item.findMany as jest.Mock).mockResolvedValue(mockDbItems);

      const items = [
        { itemId: 'item-1', quantity: 2 }, // 200
        { itemId: 'item-2', quantity: 1 }, // 200
      ];

      const result = await posService.calculateSummary('bus-1', items, 50); // subtotal = 400, discount = 50

      expect(result.subtotal).toBe(400);
      expect(result.discount).toBe(50);
      expect(result.vat).toBe(18); // Math.round(350 * 0.05) = 17.5 rounded to 18 (in Jest math is round to 18)
      expect(result.total).toBe(368); // 350 + 18
    });

    it('should return zeros for empty cart', async () => {
      const result = await posService.calculateSummary('bus-1', [], 10);
      expect(result).toEqual({ subtotal: 0, discount: 0, vat: 0, total: 0 });
    });

    it('should throw AppError 404 when item is not found in database', async () => {
      (mockPrisma.item.findMany as jest.Mock).mockResolvedValue([
        { id: 'item-1', price: new Prisma.Decimal(100), businessId: 'bus-1' },
      ]);

      const items = [
        { itemId: 'item-1', quantity: 2 },
        { itemId: 'item-2', quantity: 1 }, // missing in findMany
      ];

      await expect(posService.calculateSummary('bus-1', items, 0)).rejects.toThrow(
        new AppError('Product with ID item-2 not found', 404)
      );
    });
  });

  describe('checkout', () => {
    const defaultParams = {
      businessId: 'bus-1',
      userId: 'user-1',
      customerId: 'cust-1',
      items: [
        { itemId: 'item-1', quantity: 2 },
      ],
      discount: 20,
      paymentMethod: 'নগদ ক্যাশ',
    };

    it('should throw error for empty cart', async () => {
      await expect(posService.checkout({ ...defaultParams, items: [] })).rejects.toThrow(
        new AppError('Cart cannot be empty for checkout', 400)
      );
    });

    it('should successfully create order and handle payment update for cash sales', async () => {
      const mockDbItems = [
        { id: 'item-1', price: new Prisma.Decimal(100), businessId: 'bus-1', title: 'Product 1' },
      ];
      (mockPrisma.item.findMany as jest.Mock).mockResolvedValue(mockDbItems);
      
      // Default warehouse
      (mockPrisma.warehouse.findFirst as jest.Mock).mockResolvedValue({ id: 'wh-default', isDefault: true });

      const mockCreatedOrder = {
        id: 'order-created-id',
        total: new Prisma.Decimal(189), // subtotal 200 - 20 discount + 9 vat = 189
        discount: new Prisma.Decimal(20),
        taxAmount: new Prisma.Decimal(9),
      };
      mockOrderService.createOrder.mockResolvedValue(mockCreatedOrder as any);

      // Mock Invoice
      (mockPrisma.invoice.findUnique as jest.Mock).mockResolvedValue({ id: 'inv-1', orderId: 'order-created-id' });

      // Mock final output search
      const mockFinalOrder = {
        id: 'order-created-id',
        invoice: { invoiceNumber: 'INV-12345' },
        customer: { name: 'Customer One' },
        items: [],
      };
      (mockPrisma.order.findUnique as jest.Mock).mockResolvedValue(mockFinalOrder);

      const result = await posService.checkout(defaultParams);

      expect(mockOrderService.createOrder).toHaveBeenCalledWith(expect.objectContaining({
        businessId: 'bus-1',
        userId: 'user-1',
        customerId: 'cust-1',
        discount: 20,
        taxAmount: 9,
      }));

      // Completed payment creation checks
      expect(mockPrisma.payment.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          businessId: 'bus-1',
          orderId: 'order-created-id',
          method: 'নগদ ক্যাশ',
          status: 'COMPLETED',
        }),
      }));

      expect(mockPrisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'order-created-id' },
        data: { paymentStatus: 'COMPLETED', status: OrderStatus.CONFIRMED },
      }));

      expect(mockPrisma.invoice.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'inv-1' },
        data: expect.objectContaining({
          paidAmount: mockCreatedOrder.total,
          dueAmount: 0,
        }),
      }));

      expect(result).toEqual(mockFinalOrder);
    });

    it('should skip creating payment entries and updates for due payment method', async () => {
      const mockDbItems = [
        { id: 'item-1', price: new Prisma.Decimal(100), businessId: 'bus-1', title: 'Product 1' },
      ];
      (mockPrisma.item.findMany as jest.Mock).mockResolvedValue(mockDbItems);
      (mockPrisma.warehouse.findFirst as jest.Mock).mockResolvedValue({ id: 'wh-default', isDefault: true });

      const mockCreatedOrder = {
        id: 'order-created-id',
        total: new Prisma.Decimal(189),
      };
      mockOrderService.createOrder.mockResolvedValue(mockCreatedOrder as any);

      const mockFinalOrder = {
        id: 'order-created-id',
        invoice: { invoiceNumber: 'INV-12345' },
        customer: { name: 'Customer One' },
      };
      (mockPrisma.order.findUnique as jest.Mock).mockResolvedValue(mockFinalOrder);

      const result = await posService.checkout({
        ...defaultParams,
        paymentMethod: 'বাকি', // due account
      });

      // Verification: payment table not called, order paymentStatus not updated
      expect(mockPrisma.payment.create).not.toHaveBeenCalled();
      expect(mockPrisma.order.update).not.toHaveBeenCalled();
      expect(result).toEqual(mockFinalOrder);
    });
  });
});

// Mocking Prisma Decimal class which standard tests expect
namespace Prisma {
  export class Decimal {
    constructor(private val: number | string) {}
    toNumber() {
      return Number(this.val);
    }
    toString() {
      return String(this.val);
    }
  }
}
