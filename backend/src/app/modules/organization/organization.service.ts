import { OrganizationRepository } from './organization.repository';
import { BusinessRole } from '../../../generated/client';
import { SubscriptionGuardService } from '../subscriptions/subscription-guard.service';
import { UsageGuardService } from '../subscriptions/usage-guard.service';
import { ResourceType } from '../subscriptions/types/resource.types';
import logger from '../../lib/logger';

export class OrganizationService {
  private organizationRepository: OrganizationRepository;
  private subscriptionGuard: SubscriptionGuardService;
  private usageGuard?: UsageGuardService;

  constructor(
    subscriptionGuard?: SubscriptionGuardService,
    usageGuard?: UsageGuardService,
  ) {
    this.organizationRepository = new OrganizationRepository();
    this.subscriptionGuard = subscriptionGuard || new SubscriptionGuardService();
    this.usageGuard = usageGuard;
  }

  /**
   * List all users associated with the active tenant context
   */
  async getBusinessUsers(businessId: string) {
    const rawMembers = await this.organizationRepository.findBusinessUsers(businessId);

    return rawMembers.map((member: any) => {
      const user = member.user;
      const customRoles = user.customRoles.map((ucr: any) => ucr.customRole.name);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: member.role,
        customRoles,
        status: user.deletedAt ? 'INACTIVE' : 'ACTIVE',
        warehouseAssignment: null, // Placeholder as no user-warehouse mapping exists in db
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
}
