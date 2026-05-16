import { OrderStatus, MovementType, Prisma } from '../../../generated/client';
import { DomainEvents } from '../../../shared/events/domain-events';
import { prisma } from '../../lib/prisma';
import { OrderRepository } from './order.repository';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryRepository } from '../inventory/inventory.repository';
import { AppError } from '../../errors/AppError';
import { AuditService } from '../audit/audit.service';
import { emitDomainEvent } from '../../../shared/events/domain-events';

// Rule 5: Service Composition
// OrderService uses InventoryService for stock operations

interface CreateOrderItemInput {
  itemId: string;
  warehouseId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
}

interface CreateOrderInput {
  businessId: string;
  userId: string;
  customerId?: string;
  items: CreateOrderItemInput[];
  discount?: number;
  taxAmount?: number;
  idempotencyKey: string;
  dueDate?: Date;
  pointsToRedeem?: number;
}

export class OrderService {
  private inventoryService: InventoryService;
  private auditService: AuditService;

  constructor(private orderRepo: OrderRepository) {
    // Rule 5: Compose with InventoryService
    const inventoryRepo = new InventoryRepository();
    this.inventoryService = new InventoryService(inventoryRepo);
    this.auditService = new AuditService();
  }

  async getAllOrders(params: {
    businessId: string;
    status?: OrderStatus;
    customerId?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const { items, total } = await this.orderRepo.findAll({ ...params, skip, take: params.limit });

    return {
      items,
      meta: { page: params.page, limit: params.limit, total },
    };
  }

  async getOrderById(id: string, businessId: string) {
    const order = await this.orderRepo.findById(id, businessId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }

  /**
   * Rule 3: CRITICAL WORKFLOW — full atomic transaction.
   * Rule 4: NEVER mutate inventory directly — use StockMovements via InventoryService.
   * Rule 13: Idempotency key prevents duplicate orders on retry.
   */
  async createOrder(input: CreateOrderInput) {
    const { 
      businessId, 
      userId, 
      customerId, 
      items, 
      discount = 0, 
      taxAmount = 0, 
      idempotencyKey, 
      dueDate,
      pointsToRedeem = 0
    } = input;

    // Rule 13: Check idempotency — prevent duplicate order creation
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: true },
      });
      if (existingOrder) return existingOrder;
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const orderRepo = new OrderRepository(tx);
      const inventoryRepo = new InventoryRepository(tx);
      const inventoryService = new InventoryService(inventoryRepo);

      // 0. Handle Loyalty Redemption
      let loyaltyDiscount = 0;
      if (pointsToRedeem > 0) {
        if (!customerId) {
          throw new AppError('Customer ID is required for loyalty redemption', 400);
        }

        const customer = await tx.customer.findUnique({
          where: { id: customerId },
          include: { business: { include: { loyaltyProgram: true } } }
        });

        if (!customer || !customer.business.loyaltyProgram || !customer.business.loyaltyProgram.isActive) {
          throw new AppError('No active loyalty program found for this business', 400);
        }

        if (customer.loyaltyPoints < pointsToRedeem) {
          throw new AppError(`Insufficient loyalty points. Balance: ${customer.loyaltyPoints}`, 400);
        }

        loyaltyDiscount = Number(customer.business.loyaltyProgram.redemptionValuePerPoint) * pointsToRedeem;
        
        // Deduct points from customer
        await tx.customer.update({
          where: { id: customerId },
          data: { loyaltyPoints: { decrement: pointsToRedeem } }
        });

        // Create point entry
        await tx.loyaltyPoint.create({
          data: {
            businessId,
            customerId,
            points: -pointsToRedeem,
            reason: `Redeemed for order (Pending)`
          }
        });
      }

      // 1. Calculate total
      const itemsTotal = items.reduce((sum, item) => {
        const lineTotal = item.unitPrice * item.quantity - (item.discount || 0);
        return sum + lineTotal;
      }, 0);
      
      const totalDiscount = discount + loyaltyDiscount;
      const total = itemsTotal - totalDiscount + taxAmount;

      // 2. Create Order
      const order = await orderRepo.create({
        businessId,
        userId,
        customerId,
        idempotencyKey,
        status: OrderStatus.PENDING,
        total: new Prisma.Decimal(total),
        discount: new Prisma.Decimal(totalDiscount),
        taxAmount: new Prisma.Decimal(taxAmount),
        pointsRedeemed: pointsToRedeem,
        items: {
          create: items.map((item) => ({
            businessId,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            discount: new Prisma.Decimal(item.discount || 0),
            tax: new Prisma.Decimal(item.tax || 0),
          })),
        },
      });
      // 3. Reserve Stock (Rule 4: Move from Available to Reserved)
      await inventoryService.reserveStock({
        businessId,
        orderId: order.id,
        items: items.map(item => ({
          itemId: item.itemId,
          warehouseId: item.warehouseId,
          quantity: item.quantity,
        })),
        tx,
      });

      // 4. Emit Inventory Reserved event (to trigger BullMQ delayed release job)
      await emitDomainEvent(
        tx, 
        DomainEvents.INVENTORY_RESERVED, 
        {
          reservationId: `order-${order.id}`,
          businessId,
          orderId: order.id,
          items: items.map(i => ({ itemId: i.itemId, quantity: i.quantity }))
        }, 
        businessId,
        'Inventory',
        order.id
      );

      // 5. Auto-create Invoice (Rule 5: Service Composition)
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await tx.invoice.create({
        data: {
          businessId,
          customerId,
          orderId: order.id,
          invoiceNumber,
          totalAmount: new Prisma.Decimal(total),
          paidAmount: new Prisma.Decimal(0),
          dueAmount: new Prisma.Decimal(total),
          dueDate: dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day default
        },
      });

      // 6. Emit domain event to Outbox (Event-Driven, Rule 10)
      await emitDomainEvent(
        tx, 
        DomainEvents.ORDER_CREATED, 
        { 
          orderId: order.id, 
          businessId,
          subtotal: total - taxAmount,
          taxAmount,
          total, 
          customerId,
          itemCount: items.length
        }, 
        businessId,
        'Order',
        order.id
      );
      
      // 7. Log Audit (Rule 14: System Auditability)
      await this.auditService.log({
        businessId,
        userId,
        action: 'CREATE_ORDER',
        entityType: 'Order',
        entityId: order.id,
        newData: order,
        tx,
      });

      return order;
    });
  }

  async updateOrderStatus(id: string, businessId: string, status: OrderStatus) {
    const order = await this.getOrderById(id, businessId);

    if (order.status === status) {
      return order;
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const orderRepo = new OrderRepository(tx);
      
      const updatedOrder = await orderRepo.updateStatus(id, businessId, status);

      // Publish Outbox Event for order status change
      await emitDomainEvent(tx, DomainEvents.ORDER_STATUS_CHANGED, { 
        orderId: id, 
        businessId,
        oldStatus: order.status, 
        newStatus: status,
        aggregateType: 'Order',
        aggregateId: id,
      }, businessId);

      // Log Audit
      await this.auditService.log({
        businessId,
        userId: (updatedOrder as any).userId, // Use userId from order if available
        action: 'UPDATE_ORDER_STATUS',
        entityType: 'Order',
        entityId: id,
        previousData: { status: order.status },
        newData: { status },
        tx,
      });

      return updatedOrder;
    });
  }

  async cancelOrder(id: string, businessId: string) {
    const order = await this.getOrderById(id, businessId);

    if (([OrderStatus.DELIVERED, OrderStatus.SHIPPED] as OrderStatus[]).includes(order.status)) {
      throw new AppError('Cannot cancel an order that is already shipped or delivered', 400);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const orderRepo = new OrderRepository(tx);

      const inventoryRepo = new InventoryRepository(tx);
      const inventoryService = new InventoryService(inventoryRepo);

      // Release all stock reservations (moves from Reserved back to Available)
      await inventoryService.releaseOrderReservations(id, businessId, tx);

      // Update order status
      const cancelledOrder = await orderRepo.updateStatus(id, businessId, OrderStatus.CANCELLED);

      // Emit domain event
      await emitDomainEvent(tx, DomainEvents.ORDER_CANCELLED, { 
        orderId: id,
        businessId
      }, businessId);

      // Log Audit
      await this.auditService.log({
        businessId,
        action: 'CANCEL_ORDER',
        entityType: 'Order',
        entityId: id,
        previousData: { status: order.status },
        newData: { status: OrderStatus.CANCELLED },
        tx,
      });

      return cancelledOrder;
    });
  }
}
