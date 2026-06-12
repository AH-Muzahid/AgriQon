import { CustomerRepository } from './customer.repository';
import { AppError } from '../../errors/AppError';
import { Prisma } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

import { OrderCreatedPayload, PaymentCompletedPayload } from '../../../shared/events/domain-events';
import { logger } from '../../lib/logger';

export class CustomerService {
  private customerRepo: CustomerRepository;

  constructor(customerRepo?: CustomerRepository) {
    this.customerRepo = customerRepo || new CustomerRepository();
  }

  async getAllCustomers(params: {
    businessId: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const { items, total } = await this.customerRepo.findAll({
      ...params,
      skip,
      take: params.limit,
    });

    return {
      items,
      meta: { page: params.page, limit: params.limit, total },
    };
  }

  async getCustomerById(id: string, businessId: string) {
    const customer = await this.customerRepo.findById(id, businessId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    return customer;
  }

  async createCustomer(businessId: string, data: Prisma.CustomerUncheckedCreateInput) {
    return await this.customerRepo.create({ ...data, businessId });
  }

  async updateCustomer(id: string, businessId: string, data: Prisma.CustomerUpdateInput) {
    await this.getCustomerById(id, businessId);
    return await this.customerRepo.update(id, businessId, data);
  }

  async deleteCustomer(id: string, businessId: string) {
    await this.getCustomerById(id, businessId);
    // Rule 14: Soft delete only
    return await this.customerRepo.softDelete(id, businessId);
  }

  async getCustomerLedger(customerId: string, businessId: string) {
    await this.getCustomerById(customerId, businessId);

    const invoices = await prisma.invoice.findMany({
      where: { customerId, businessId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const payments = await prisma.payment.findMany({
      where: {
        businessId,
        order: {
          customerId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const ledger = [
      ...invoices.map((inv: any) => ({
        id: inv.id,
        type: 'INVOICE',
        date: inv.createdAt,
        reference: inv.invoiceNumber,
        amount: Number(inv.totalAmount),
        status: inv.dueAmount === 0 ? 'PAID' : Number(inv.paidAmount) > 0 ? 'PARTIAL' : 'UNPAID',
      })),
      ...payments.map((p: any) => ({
        id: p.id,
        type: 'PAYMENT',
        date: p.createdAt,
        reference: p.transactionId || `PAY-${p.id.substring(0, 8).toUpperCase()}`,
        amount: -Number(p.amount), // Credit is negative
        status: p.status,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return ledger;
  }

  /**
   * Handle ORDER_CREATED event
   */
  async handleOrderCreated(payload: OrderCreatedPayload) {
    // Currently we just log, but we could update "lastOrderDate" or "totalOrders" here
    logger.info(`[CustomerService] Handling ORDER_CREATED for order ${payload.orderId}`);
  }

  /**
   * Handle PAYMENT_COMPLETED event
   * Updates loyalty points based on the amount paid
   */
  async handlePaymentCompleted(payload: PaymentCompletedPayload) {
    const { orderId, businessId, customerId, amount } = payload;

    if (!customerId) {
      logger.debug(`[CustomerService] Skipping loyalty points for order ${orderId}: No customerId`);
      return;
    }

    try {
      const loyaltyProgram = await this.customerRepo.getLoyaltyProgram(businessId);

      if (!loyaltyProgram || !loyaltyProgram.isActive) {
        logger.debug(`[CustomerService] Skipping loyalty points for business ${businessId}: No active program`);
        return;
      }

      const pointsToEarn = Math.floor(Number(amount) * Number(loyaltyProgram.pointsPerUnit));

      if (pointsToEarn > 0) {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          // 1. Add points to customer history
          await tx.loyaltyPoint.create({
            data: {
              customerId,
              businessId,
              points: pointsToEarn,
              reason: `Earned points for order ${orderId}`,
            },
          });

          // 2. Update customer balance
          await tx.customer.update({
            where: { id: customerId, businessId },
            data: { loyaltyPoints: { increment: pointsToEarn } },
          });

          // 3. Update order with earned points
          await tx.order.update({
            where: { id: orderId, businessId },
            data: { pointsEarned: pointsToEarn },
          });
        });

        logger.info(`[CustomerService] Added ${pointsToEarn} loyalty points to customer ${customerId} for order ${orderId}`);
      }
    } catch (error: any) {
      logger.error(`[CustomerService] Error handling PAYMENT_COMPLETED: ${error.message}`, {
        orderId,
        customerId,
      });
    }
  }
}
