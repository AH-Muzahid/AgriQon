import { prisma } from '../../lib/prisma';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import { SubscriptionStatus, SubscriptionChangeRequestStatus, Prisma } from '../../../generated/client';

export class SubscriptionAutomationService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Automate subscription updates after payment verification.
   */
  async handlePaymentVerified(paymentId: string) {
    // We run the automation flow inside a database transaction to ensure atomicity
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Fetch Payment & Invoice
      const payment = await tx.subscriptionPayment.findUnique({
        where: { id: paymentId },
        include: {
          invoice: {
            include: {
              changeRequest: true,
            },
          },
        },
      });

      if (!payment) {
        throw new AppError('Payment not found', httpStatus.NOT_FOUND);
      }

      if (payment.status !== 'VERIFIED') {
        throw new AppError(`Cannot automate plan activation for payment status: ${payment.status}`, httpStatus.BAD_REQUEST);
      }

      const invoice = payment.invoice;
      if (!invoice) {
        throw new AppError('Invoice not found for payment', httpStatus.NOT_FOUND);
      }

      const request = invoice.changeRequest;
      if (!request) {
        console.log(`[SubscriptionAutomationService] No change request associated with invoice ${invoice.id}. Skipping automation.`);
        return { success: true, message: 'No change request associated with invoice.' };
      }

      // Idempotency: Lock the request by setting status to PROCESSING if it is currently PENDING
      const updateResult = await tx.subscriptionChangeRequest.updateMany({
        where: {
          id: request.id,
          status: SubscriptionChangeRequestStatus.PENDING,
        },
        data: {
          status: SubscriptionChangeRequestStatus.PROCESSING,
        },
      });

      if (updateResult.count === 0) {
        console.log(`[SubscriptionAutomationService] Request ${request.id} is already processed or processing. Skipping.`);
        return { success: true, message: 'Request already processed or processing.' };
      }

      try {
        // 2. Validate Invoice Amount Matches Expected Request Amount
        const targetPlan = await tx.subscriptionPlan.findUnique({
          where: { code: request.requestedPlanCode },
        });
        if (!targetPlan) {
          throw new AppError(`Subscription plan ${request.requestedPlanCode} does not exist`, httpStatus.NOT_FOUND);
        }
        const expectedPrice = Number(targetPlan.price);

        if (Number(invoice.amount) !== expectedPrice) {
          throw new AppError(`Invoice amount (${invoice.amount}) does not match expected plan price (${expectedPrice})`, httpStatus.BAD_REQUEST);
        }

        // 3. Fetch current subscription
        const subscription = await tx.subscription.findUnique({
          where: { id: request.subscriptionId },
          include: { plan: true },
        });

        if (!subscription) {
          throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
        }

        const previousPlanCode = subscription.plan.code;
        const newPlanCode = request.requestedPlanCode;

        // Calculate extended expiration date: standard 30 days extension
        const baseTime = Math.max(Date.now(), subscription.expiresAt.getTime());
        const newExpiresAt = new Date(baseTime + 30 * 24 * 60 * 60 * 1000);

        if (request.type === 'UPGRADE') {
          // Fetch target plan
          const newPlan = await tx.subscriptionPlan.findUnique({
            where: { code: newPlanCode },
          });

          if (!newPlan) {
            throw new AppError(`Target subscription plan ${newPlanCode} not found`, httpStatus.NOT_FOUND);
          }

          // Switch plan and update subscription details
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              planId: newPlan.id,
              status: SubscriptionStatus.ACTIVE,
              expiresAt: newExpiresAt,
              graceEndsAt: null, // Recovery from grace period
            },
          });
        } else if (request.type === 'RENEWAL') {
          // Process renewal: extend current plan
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: SubscriptionStatus.ACTIVE,
              expiresAt: newExpiresAt,
              graceEndsAt: null, // Recovery from grace period
            },
          });
        }

        // 4. Finalize Change Request status
        const completedRequest = await tx.subscriptionChangeRequest.update({
          where: { id: request.id },
          data: {
            status: SubscriptionChangeRequestStatus.COMPLETED,
            processedAt: new Date(),
          },
        });

        // 5. Create SubscriptionEvent record
        await tx.subscriptionEvent.create({
          data: {
            subscriptionId: subscription.id,
            eventType: `SUBSCRIPTION_${request.type}_COMPLETED`,
            payload: {
              requestId: request.id,
              paymentId: payment.id,
              previousPlanCode,
              newPlanCode,
              amount: expectedPrice,
              expiresAt: newExpiresAt.toISOString(),
            },
          },
        });

        // 6. Log Audit Event
        await this.auditService.log({
          businessId: request.businessId,
          action: `SUBSCRIPTION_${request.type}_AUTOMATION_COMPLETED`,
          entityType: 'SubscriptionChangeRequest',
          entityId: request.id,
          newData: {
            requestId: request.id,
            paymentId: payment.id,
            previousPlanCode,
            newPlanCode,
            expiresAt: newExpiresAt,
          },
          tx,
        });

        return {
          success: true,
          request: completedRequest,
          previousPlanCode,
          newPlanCode,
        };
      } catch (error) {
        // If anything fails inside processing, mark status as FAILED
        await tx.subscriptionChangeRequest.update({
          where: { id: request.id },
          data: {
            status: SubscriptionChangeRequestStatus.FAILED,
            processedAt: new Date(),
          },
        });

        // Log Failure Audit Event
        await this.auditService.log({
          businessId: request.businessId,
          action: `SUBSCRIPTION_${request.type}_AUTOMATION_FAILED`,
          entityType: 'SubscriptionChangeRequest',
          entityId: request.id,
          newData: {
            requestId: request.id,
            paymentId: payment.id,
            error: error instanceof Error ? error.message : String(error),
          },
          tx,
        });

        throw error;
      }
    });
  }
}
