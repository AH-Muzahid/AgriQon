import { OrganizationRepository } from './organization.repository';
import { SubscriptionGuardService } from '../subscriptions/subscription-guard.service';
import { UsageGuardService } from '../subscriptions/usage-guard.service';
import { ReadOnlyGuardService } from '../subscriptions/read-only-guard.service';
import { ResourceType } from '../subscriptions/types/resource.types';
import { BusinessRole } from '../../../generated/client';
import { logger } from '../../lib/logger';

export class OrganizationService {
  constructor(
    private organizationRepository: OrganizationRepository,
    private subscriptionGuard: SubscriptionGuardService,
    private usageGuard?: UsageGuardService,
    private readOnlyGuard?: ReadOnlyGuardService,
  ) {}

  async getBusinessUsers(businessId: string) {
    const users = await this.organizationRepository.findBusinessUsers(businessId);
    return users.map((u: any) => {
      // Map details and custom role arrays to direct permission listings
      const permissionsSet = new Set<string>();
      u.user.customRoles.forEach((cr: any) => {
        cr.customRole.permissions.forEach((p: any) => permissionsSet.add(p));
      });

      return {
        id: u.user.id,
        name: u.user.name,
        email: u.user.email,
        role: u.role,
        permissions: Array.from(permissionsSet),
      };
    });
  }

  /**
   * Invite a new user to the business and mock email sending
   */
  async inviteUser(params: {
    email: string;
    name: string;
    role: BusinessRole;
    businessId: string;
    actorId?: string;
  }) {
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(params.businessId);
    }

    // Phase S3: Subscription enforcement
    await this.subscriptionGuard.validateBusinessSubscription(params.businessId);

    // Phase S5: Usage limit enforcement
    if (this.usageGuard) {
      await this.usageGuard.validateUsageLimit(params.businessId, ResourceType.USERS, params.actorId);
    }

    const result = await this.organizationRepository.inviteUser({
      email: params.email,
      name: params.name,
      role: params.role,
      businessId: params.businessId,
    });

    // Mock Email sending
    logger.info(`[EMAIL SIMULATOR] Invitation email sent to ${params.email} (${params.name}) for role ${params.role} in business ${params.businessId}`);

    return {
      message: 'Invitation sent successfully (simulated)',
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.role,
      },
    };
  }

  /**
   * Revoke a user's access from the business
   */
  async revokeUser(userId: string, businessId: string) {
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(businessId);
    }

    return await this.organizationRepository.revokeUser(userId, businessId);
  }

  /**
   * Update a user's role within the business
   */
  async updateRole(userId: string, businessId: string, role: BusinessRole) {
    if (this.readOnlyGuard) {
      await this.readOnlyGuard.validateBusinessWritable(businessId);
    }

    return await this.organizationRepository.updateUserRole(userId, businessId, role);
  }
}
