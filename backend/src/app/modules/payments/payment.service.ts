import { IPayment } from './payment.interface';
import { runInTransaction } from '../../../shared/transactions/transaction.helper';
import { GatewayFactory } from './gateways/gateway.factory';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import { PAYMENT_STATUS } from './payment.constants';

/**
 * Service orchestrator for Payments.
 */
const initiatePayment = async (payload: IPayment) => {
  // 1. Verify invoice/order exists
  // Prisma transaction or simple query
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
};

const handlePaymentSuccess = async (transactionId: string) => {
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
    const updatedPayment = await tx.payment.update({
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
    await tx.outboxEvent.create({
      data: {
        businessId: payment.businessId,
        aggregateType: 'Payment',
        aggregateId: payment.id,
        eventType: 'PaymentCompleted',
        payload: {
          paymentId: payment.id,
          orderId: payment.orderId,
          amount: payment.amount,
          method: payment.method
        }
      }
    });

    return { success: true, message: 'Payment successfully processed and reconciled.' };
  });
};

const verifyAndHandleWebhook = async (gatewayName: string, payload: any) => {
  const gateway = GatewayFactory.getGateway(gatewayName);
  const verificationResult = await gateway.verifyPayment(payload);

  if (!verificationResult.isVerified) {
    throw new AppError('Webhook signature verification failed', httpStatus.UNAUTHORIZED);
  }

  if (verificationResult.status === 'SUCCESS') {
    return await handlePaymentSuccess(verificationResult.transactionId);
  }

  return { success: false, message: `Payment status is ${verificationResult.status}` };
};

export const PaymentService = {
  initiatePayment,
  handlePaymentSuccess,
  verifyAndHandleWebhook,
};
