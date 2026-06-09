import { IPayment } from './payment.interface';
import { runInTransaction } from '../../../shared/transactions/transaction.helper';
import { GatewayFactory } from './gateways/gateway.factory';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import { PAYMENT_STATUS } from './payment.constants';
import { DomainEvents, emitDomainEvent } from '../../../shared/events/domain-events';
import { PaymentRepository } from './payment.repository';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';
import { Prisma } from '../../../generated/client';

export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository,
    private readOnlyGuard?: ReadOnlyGuardService
  ) {}

  /**
   * Service orchestrator for Payments.
   */
  async initiatePayment(payload: IPayment) {
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(payload.businessId);
    }

    // 1. Verify invoice/order exists
    const order = await prisma.order.findUnique({
      where: { id: payload.invoiceId } // mapping invoiceId to orderId based on schema
    });

    if (!order) {
      throw new AppError('Order not found', httpStatus.NOT_FOUND);
    }

    // 2. Initialize gateway adapter
    const gateway = GatewayFactory.getGateway(payload.gateway);

    // 3. Create payment intent
    const gatewayResponse = await gateway.initiatePayment({
      amount: payload.amount,
      currency: payload.currency,
      orderId: payload.invoiceId,
      metadata: payload.metadata
    });

    if (!gatewayResponse.success) {
      throw new AppError('Failed to initiate payment with gateway', httpStatus.BAD_REQUEST);
    }

    // 4. Record pending payment in DB
    const payment = await prisma.payment.create({
      data: {
        businessId: payload.businessId,
        orderId: payload.invoiceId,
        amount: payload.amount,
        method: payload.gateway,
        status: PAYMENT_STATUS.PENDING,
        transactionId: gatewayResponse.transactionId
      }
    });

    return {
      paymentId: payment.id,
      clientSecret: gatewayResponse.clientSecret,
      paymentUrl: gatewayResponse.paymentUrl,
      transactionId: gatewayResponse.transactionId,
      status: PAYMENT_STATUS.PENDING,
    };
  }

  async handlePaymentSuccess(transactionId: string) {
    // Execute distributed logic using Interactive Transaction
    return await runInTransaction(async (tx) => {
      // Find the payment
      const payment = await tx.payment.findFirst({
        where: { transactionId }
      });

      if (!payment) {
        throw new AppError('Payment not found for transaction ID', httpStatus.NOT_FOUND);
      }

      if (payment.status === PAYMENT_STATUS.COMPLETED) {
        return { success: true, message: 'Payment already processed' };
      }

      // 1. Update Payment status to COMPLETED
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PAYMENT_STATUS.COMPLETED }
      });

      // 2. Mark Order as PAID (Assuming PaymentStatus on Order)
      await tx.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: PAYMENT_STATUS.COMPLETED }
      });

      // 3. Update Invoice if it exists for this order
      const invoice = await tx.invoice.findUnique({
        where: { orderId: payment.orderId }
      });

      if (invoice) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { 
            paidAmount: { increment: payment.amount },
            dueAmount: { decrement: payment.amount }
          }
        });
      }

      // 4. Emit Domain Event (Outbox Pattern)
      await emitDomainEvent(
        tx,
        DomainEvents.PAYMENT_COMPLETED,
        {
          paymentId: payment.id,
          orderId: payment.orderId,
          businessId: payment.businessId,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          transactionId: payment.transactionId
        },
        payment.businessId,
        'Payment',
        payment.id
      );

      return { success: true, message: 'Payment successfully processed and reconciled.' };
    });
  }

  async verifyAndHandleWebhook(gatewayName: string, payload: any) {
    const gateway = GatewayFactory.getGateway(gatewayName);
    const verificationResult = await gateway.verifyPayment(payload);

    if (!verificationResult.isVerified) {
      throw new AppError('Webhook signature verification failed', httpStatus.UNAUTHORIZED);
    }

    // 1. Idempotency check — check if we already processed this event
    if (verificationResult.transactionId) {
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { externalId: verificationResult.transactionId }
      });
      if (existingEvent && existingEvent.status === 'PROCESSED') {
        return { success: true, message: 'Event already processed' };
      }
    }

    // 2. Persist Webhook Event (for audit and DLQ)
    const webhookEvent = await prisma.webhookEvent.upsert({
      where: { externalId: verificationResult.transactionId || `unknown-${Date.now()}` },
      update: { 
        attempts: { increment: 1 },
        processingAt: new Date()
      },
      create: {
        provider: gatewayName,
        externalId: verificationResult.transactionId,
        payload: payload.body || payload,
        status: 'PENDING',
        attempts: 1,
        processingAt: new Date()
      }
    });

    try {
      if (verificationResult.status === 'SUCCESS') {
        const result = await this.handlePaymentSuccess(verificationResult.transactionId);
        
        // Mark as PROCESSED
        await prisma.webhookEvent.update({
          where: { id: webhookEvent.id },
          data: { 
            status: 'PROCESSED',
            processedAt: new Date()
          }
        });

        return result;
      }

      return { success: false, message: `Payment status is ${verificationResult.status}` };
    } catch (error) {
      // Mark as FAILED for DLQ to pick up
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { 
          status: 'FAILED',
          lastError: error instanceof Error ? error.message : String(error),
          nextAttemptAt: new Date(Date.now() + 5 * 60000) // Retry in 5 mins
        }
      });
      throw error;
    }
  }

  async handleRefund(params: { paymentId: string; amount: number; reason?: string }) {
    const { paymentId, amount, reason } = params;

    // Retrieve the payment first to obtain the business context
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      throw new AppError('Payment not found', httpStatus.NOT_FOUND);
    }

    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(payment.businessId);
    }

    return await runInTransaction(async (tx) => {
      // 1. Record Refund
      const refund = await tx.refund.create({
        data: {
          businessId: payment.businessId,
          paymentId: payment.id,
          amount,
          reason,
          status: 'COMPLETED'
        }
      });

      // 2. Update Payment status if fully refunded (simplified logic)
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PAYMENT_STATUS.REFUNDED }
      });

      // 3. Emit Domain Event
      await emitDomainEvent(
        tx,
        DomainEvents.PAYMENT_REFUNDED,
        {
          paymentId: payment.id,
          orderId: payment.orderId,
          businessId: payment.businessId,
          amount,
          reason,
          transactionId: payment.transactionId
        },
        payment.businessId,
        'Payment',
        payment.id
      );

      return refund;
    });
  }

  async getAllPayments(params: {
    businessId: string;
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
    status?: any;
    invoiceId?: string;
    customerId?: string;
  }) {
    return await this.paymentRepository.findAll(params);
  }

  async getPaymentById(id: string, businessId: string) {
    const payment = await this.paymentRepository.findById(id, businessId);
    if (!payment) {
      throw new AppError('Payment not found', httpStatus.NOT_FOUND);
    }
    return payment;
  }
}
