import { SubscriptionRepository } from './subscription.repository';
import { SubscriptionStatus } from '../../../generated/client';
import { env } from '../../../config/env';
import { prisma } from '../../lib/prisma';
import { AuditService } from '../audit/audit.service';

export class SubscriptionLifecycleService {
  private subscriptionRepository: SubscriptionRepository;
  private auditService: AuditService;

  constructor(
    subscriptionRepository?: SubscriptionRepository,
    auditService?: AuditService
  ) {
    this.subscriptionRepository = subscriptionRepository || new SubscriptionRepository();
    this.auditService = auditService || new AuditService();
  }

  /**
   * Process expired subscriptions and update their statuses:
   * 1. TRIAL / ACTIVE -> GRACE_PERIOD (when expiresAt < now)
   * 2. GRACE_PERIOD -> SUSPENDED (when graceEndsAt < now)
   */
  async processExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    const graceDays = env.subscriptionGraceDays;

    // 1. Transition TRIAL & ACTIVE to GRACE_PERIOD
    const toGracePeriod = await prisma.subscription.findMany({
      where: {
        status: { in: [SubscriptionStatus.TRIAL, SubscriptionStatus.ACTIVE] },
        expiresAt: { lt: now },
      },
    });

    for (const sub of toGracePeriod) {
      const graceEndsAt = new Date(sub.expiresAt.getTime() + graceDays * 24 * 60 * 60 * 1000);
      const previousStatus = sub.status;

      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: SubscriptionStatus.GRACE_PERIOD,
          graceEndsAt,
        },
      });

      // Best-effort audit logging
      try {
        await this.auditService.log({
          businessId: sub.businessId,
          action: 'SUBSCRIPTION_ENTERED_GRACE_PERIOD',
          entityType: 'Subscription',
          entityId: sub.id,
          newData: {
            businessId: sub.businessId,
            subscriptionId: sub.id,
            previousStatus,
            graceEndsAt,
          },
        });
      } catch (err) {
        // Swallowed to prevent blocking processing
      }
    }

    // 2. Transition GRACE_PERIOD to SUSPENDED
    const toSuspended = await prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.GRACE_PERIOD,
        graceEndsAt: { lt: now },
      },
    });

    for (const sub of toSuspended) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: {
          status: SubscriptionStatus.SUSPENDED,
        },
      });

      // Best-effort audit logging
      try {
        await this.auditService.log({
          businessId: sub.businessId,
          action: 'SUBSCRIPTION_SUSPENDED',
          entityType: 'Subscription',
          entityId: sub.id,
          newData: {
            businessId: sub.businessId,
            subscriptionId: sub.id,
            graceEndsAt: sub.graceEndsAt,
          },
        });
      } catch (err) {
        // Swallowed to prevent blocking processing
      }
    }
  }
}
