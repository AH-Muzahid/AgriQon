import { prisma } from '../../lib/prisma';
import { AuditService } from '../audit/audit.service';
import { GatewayFactory } from './gateways/gateway.factory';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import { PaymentGateway, SubscriptionPaymentStatus, Prisma } from '../../../generated/client';

export class PaymentWebhookService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Processes a webhook callback from a gateway.
   */
  async handleWebhook(params: {
    gateway: PaymentGateway | string;
    payload: any;
    headers: any;
  }) {
    const gatewayName = params.gateway.toUpperCase() as PaymentGateway;
    const provider = GatewayFactory.getProvider(gatewayName);

    // 1. Process webhook via the specific provider
    const hookResult = await provider.processWebhook(params.payload, params.headers);

    // Record webhook event in the database for tracking
    const externalEventId = params.payload.val_id || params.payload.paymentID || params.payload.payment_ref_id || `EVT_${Date.now()}`;
    
    // Webhook Replay Protection: check if event has already been processed
    const existingEvent = await prisma.paymentWebhookEvent.findUnique({
      where: { externalEventId },
    });
    if (existingEvent) {
      console.log(`[PaymentWebhookService] Webhook event ${externalEventId} already processed. Skipping.`);
      return { success: true, reason: 'Duplicate event skipped' };
    }

    // Save webhook event log
    await prisma.paymentWebhookEvent.create({
      data: {
        gateway: gatewayName,
        externalEventId,
        payload: params.payload,
        status: hookResult.isVerified ? 'PROCESSED' : 'FAILED',
      },
    });

    // Log audit event for webhook receipt
    await this.auditService.log({
      businessId: 'SYSTEM', // System level callback, business context resolved below
      action: 'PAYMENT_WEBHOOK_RECEIVED',
      entityType: 'PaymentWebhookEvent',
      entityId: externalEventId,
      newData: { gateway: gatewayName, externalEventId },
    });

    if (!hookResult.isVerified) {
      console.warn(`[PaymentWebhookService] Webhook signature invalid for gateway ${gatewayName}`);
      return { success: false, reason: 'Invalid signature' };
    }

    // 2. Resolve Payment details and perform Idempotency Checks
    const gatewayPaymentId = hookResult.gatewayReference;
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { gatewayPaymentId },
    });

    if (!payment) {
      console.warn(`[PaymentWebhookService] Payment record not found for gateway reference ${gatewayPaymentId}`);
      return { success: false, reason: 'Payment record not found' };
    }

    // Double webhook processing prevention
    if (payment.status === 'VERIFIED') {
      console.log(`[PaymentWebhookService] Payment ${payment.id} already verified. Skipping invoice settlement.`);
      return { success: true, payment };
    }

    const nextStatus: SubscriptionPaymentStatus = hookResult.status === 'SUCCESS' ? 'VERIFIED' : 'FAILED';

    // 3. Atomically update payment status & invoice status
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update Payment
      const updatedPayment = await tx.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: nextStatus,
          gatewayTransactionId: hookResult.transactionId,
          webhookReceivedAt: new Date(),
          verifiedAt: nextStatus === 'VERIFIED' ? new Date() : null,
        },
      });

      // Update Invoice if payment is VERIFIED
      if (nextStatus === 'VERIFIED') {
        const invoice = await tx.subscriptionInvoice.findUnique({
          where: { id: payment.invoiceId },
        });

        if (invoice && invoice.status === 'PENDING') {
          await tx.subscriptionInvoice.update({
            where: { id: payment.invoiceId },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });
        }

        // Log SUCCESS audit event
        await this.auditService.log({
          businessId: payment.businessId,
          action: 'PAYMENT_VERIFIED',
          entityType: 'SubscriptionPayment',
          entityId: payment.id,
          newData: {
            paymentId: payment.id,
            invoiceId: payment.invoiceId,
            gatewayTransactionId: hookResult.transactionId,
          },
          tx,
        });
      } else {
        // Log FAILURE audit event
        await this.auditService.log({
          businessId: payment.businessId,
          action: 'PAYMENT_VERIFICATION_FAILED',
          entityType: 'SubscriptionPayment',
          entityId: payment.id,
          newData: {
            paymentId: payment.id,
            invoiceId: payment.invoiceId,
          },
          tx,
        });
      }

      return { success: true, payment: updatedPayment };
    });
  }
}
