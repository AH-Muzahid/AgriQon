import { PrismaClient, OrderStatus, Prisma } from '../../../generated/client';
import { prisma } from '../../lib/prisma';
import { OrderService } from '../orders/order.service';
import { AppError } from '../../errors/AppError';
import { emitDomainEvent, DomainEvents } from '../../../shared/events/domain-events';

export class PosService {
  private prisma: PrismaClient;

  constructor(private orderService: OrderService) {
    this.prisma = prisma;
  }

  async calculateSummary(
    businessId: string,
    items: { itemId: string; quantity: number }[],
    discount: number
  ) {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        discount: 0,
        vat: 0,
        total: 0,
      };
    }

    const itemIds = items.map((i) => i.itemId);

    // Resolve prices from DB
    const dbItems = await this.prisma.item.findMany({
      where: {
        id: { in: itemIds },
        businessId,
        deletedAt: null,
      },
    });

    let subtotal = 0;
    for (const item of items) {
      const dbItem = dbItems.find((d) => d.id === item.itemId);
      if (!dbItem) {
        throw new AppError(`Product with ID ${item.itemId} not found`, 404);
      }
      subtotal += Number(dbItem.price) * item.quantity;
    }

    // VAT is 5% of (subtotal - discount)
    const taxableAmount = Math.max(0, subtotal - discount);
    const vat = Math.round(taxableAmount * 0.05);
    const total = Math.max(0, taxableAmount + vat);

    return {
      subtotal,
      discount,
      vat,
      total,
    };
  }

  async checkout(params: {
    businessId: string;
    userId: string;
    customerId?: string;
    items: { itemId: string; quantity: number }[];
    discount: number;
    paymentMethod: string;
    dueDate?: Date;
  }) {
    const { businessId, userId, customerId, items, discount, paymentMethod, dueDate } = params;

    if (!items || items.length === 0) {
      throw new AppError('Cart cannot be empty for checkout', 400);
    }

    // 1. Resolve item pricing from the database
    const itemIds = items.map((i) => i.itemId);
    const dbItems = await this.prisma.item.findMany({
      where: {
        id: { in: itemIds },
        businessId,
        deletedAt: null,
      },
    });

    if (dbItems.length !== items.length) {
      throw new AppError('Some products in the cart are invalid or deleted', 400);
    }

    // 2. Resolve default warehouse for the business
    const defaultWarehouse = await this.prisma.warehouse.findFirst({
      where: { businessId, isDefault: true },
    });

    let targetWarehouseId = defaultWarehouse?.id;
    if (!targetWarehouseId) {
      const firstWarehouse = await this.prisma.warehouse.findFirst({
        where: { businessId },
      });
      if (!firstWarehouse) {
        throw new AppError('No warehouses configured for this business. Setup a warehouse first.', 400);
      }
      targetWarehouseId = firstWarehouse.id;
    }

    // 3. Prepare order items
    const orderItemsInput = items.map((item) => {
      const dbItem = dbItems.find((d) => d.id === item.itemId)!;
      return {
        itemId: item.itemId,
        warehouseId: targetWarehouseId!,
        quantity: item.quantity,
        unitPrice: Number(dbItem.price),
        discount: 0,
        tax: 0,
      };
    });

    // 4. Calculate total & VAT on backend
    const summary = await this.calculateSummary(businessId, items, discount);

    // 5. Generate a unique idempotency key for the order
    const crypto = require('crypto');
    const idempotencyKey = crypto.randomUUID();

    // 6. Create the order
    const order = await this.orderService.createOrder({
      businessId,
      userId,
      customerId: customerId === 'guest' ? undefined : customerId,
      items: orderItemsInput,
      discount: summary.discount,
      taxAmount: summary.vat,
      idempotencyKey,
      dueDate,
    });

    // 7. If paid (not "বাকি"), register the completed payment and update invoice/order
    if (paymentMethod !== 'বাকি') {
      await this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            businessId,
            orderId: order.id,
            amount: order.total,
            method: paymentMethod,
            status: 'COMPLETED',
            transactionId: `POS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'COMPLETED', status: OrderStatus.CONFIRMED },
        });

        const invoice = await tx.invoice.findUnique({
          where: { orderId: order.id },
        });

        if (invoice) {
          await tx.invoice.update({
            where: { id: invoice.id },
            data: {
              paidAmount: order.total,
              dueAmount: 0,
            },
          });
        }

        // Emit Payment Completed Event to trigger accounting logs
        await emitDomainEvent(
          tx,
          DomainEvents.PAYMENT_COMPLETED,
          {
            paymentId: payment.id,
            orderId: order.id,
            businessId,
            amount: Number(order.total),
            currency: 'BDT',
            method: paymentMethod,
            transactionId: payment.transactionId,
          },
          businessId,
          'Payment',
          payment.id
        );
      });
    }

    // 8. Return the complete order including the invoice details
    const finalOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: {
        invoice: true,
        customer: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    return finalOrder;
  }
}
