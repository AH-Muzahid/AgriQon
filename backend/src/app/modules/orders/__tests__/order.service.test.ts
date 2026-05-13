import { OrderService } from '../order.service';
import { OrderRepository } from '../order.repository';
import { InventoryRepository } from '../../inventory/inventory.repository';
import { InventoryService } from '../../inventory/inventory.service';
import { AppError } from '../../../errors/AppError';
import { OrderStatus, Prisma } from '../../../../generated/client';

// Mock the raw prisma client used for idempotency check and $transaction
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('../order.repository');
jest.mock('../../inventory/inventory.repository');
jest.mock('../../inventory/inventory.service');

import { prisma } from '../../../lib/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('OrderService', () => {
  let orderService: OrderService;
  let mockOrderRepo: jest.Mocked<OrderRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOrderRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
    } as unknown as jest.Mocked<OrderRepository>;

    (OrderRepository as jest.Mock).mockImplementation(() => mockOrderRepo);
    (InventoryRepository as jest.Mock).mockImplementation(() => ({}));
    (InventoryService as jest.Mock).mockImplementation(() => ({
      adjustStock: jest.fn(),
    }));

    orderService = new OrderService(mockOrderRepo);
  });

  describe('getAllOrders', () => {
    it('should calculate pagination and return paginated result', async () => {
      mockOrderRepo.findAll.mockResolvedValue({
        items: [] as any,
        total: 25,
      });

      const result = await orderService.getAllOrders({
        businessId: 'bus-1',
        page: 3,
        limit: 10,
      });

      expect(mockOrderRepo.findAll).toHaveBeenCalledWith({
        businessId: 'bus-1',
        page: 3,
        limit: 10,
        skip: 20, // (3-1) * 10
        take: 10,
      });
      expect(result.meta).toEqual({ page: 3, limit: 10, total: 25 });
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockOrder = { id: 'order-1', businessId: 'bus-1' };
      mockOrderRepo.findById.mockResolvedValue(mockOrder as any);

      const result = await orderService.getOrderById('order-1', 'bus-1');
      expect(result).toEqual(mockOrder);
    });

    it('should throw AppError 404 when order is not found', async () => {
      mockOrderRepo.findById.mockResolvedValue(null);

      await expect(orderService.getOrderById('missing-id', 'bus-1')).rejects.toThrow(
        new AppError('Order not found', 404)
      );
    });
  });

  describe('createOrder — idempotency', () => {
    const baseInput = {
      businessId: 'bus-1',
      userId: 'user-1',
      idempotencyKey: 'key-abc-123',
      items: [
        {
          itemId: 'item-1',
          warehouseId: 'wh-1',
          quantity: 2,
          unitPrice: 50,
        },
      ],
    };

    it('should return existing order when idempotency key already exists', async () => {
      const existingOrder = { id: 'order-existing', idempotencyKey: 'key-abc-123', items: [] };
      (mockPrisma.order.findUnique as jest.Mock).mockResolvedValue(existingOrder);

      const result = await orderService.createOrder(baseInput);

      expect(result).toEqual(existingOrder);
      // $transaction must NOT be called — idempotency short-circuits
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should proceed to $transaction when no existing order with that key', async () => {
      (mockPrisma.order.findUnique as jest.Mock).mockResolvedValue(null);
      const mockNewOrder = { id: 'order-new', status: OrderStatus.PENDING };
      (mockPrisma.$transaction as jest.Mock).mockResolvedValue(mockNewOrder);

      const result = await orderService.createOrder(baseInput);

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockNewOrder);
    });
  });

  describe('cancelOrder', () => {
    it('should throw AppError 400 when order is already SHIPPED', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        id: 'order-1',
        businessId: 'bus-1',
        status: OrderStatus.SHIPPED,
      } as any);

      await expect(orderService.cancelOrder('order-1', 'bus-1')).rejects.toThrow(
        new AppError('Cannot cancel an order that is already shipped or delivered', 400)
      );
    });

    it('should throw AppError 400 when order is already DELIVERED', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        id: 'order-1',
        businessId: 'bus-1',
        status: OrderStatus.DELIVERED,
      } as any);

      await expect(orderService.cancelOrder('order-1', 'bus-1')).rejects.toThrow(
        new AppError('Cannot cancel an order that is already shipped or delivered', 400)
      );
    });

    it('should proceed to $transaction for PENDING orders', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        id: 'order-1',
        businessId: 'bus-1',
        status: OrderStatus.PENDING,
      } as any);
      const cancelledOrder = { id: 'order-1', status: OrderStatus.CANCELLED };
      (mockPrisma.$transaction as jest.Mock).mockResolvedValue(cancelledOrder);

      const result = await orderService.cancelOrder('order-1', 'bus-1');

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(cancelledOrder);
    });
  });

  describe('updateOrderStatus', () => {
    it('should return current order without transaction when status is unchanged', async () => {
      const currentOrder = { id: 'order-1', status: OrderStatus.PENDING };
      mockOrderRepo.findById.mockResolvedValue(currentOrder as any);

      const result = await orderService.updateOrderStatus('order-1', 'bus-1', OrderStatus.PENDING);

      expect(result).toEqual(currentOrder);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should call $transaction when status actually changes', async () => {
      mockOrderRepo.findById.mockResolvedValue({
        id: 'order-1',
        status: OrderStatus.PENDING,
      } as any);
      const updatedOrder = { id: 'order-1', status: OrderStatus.CONFIRMED };
      (mockPrisma.$transaction as jest.Mock).mockResolvedValue(updatedOrder);

      const result = await orderService.updateOrderStatus('order-1', 'bus-1', OrderStatus.CONFIRMED);

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedOrder);
    });
  });
});
