import { OrganizationRepository } from './organization.repository';
import { BusinessRole } from '../../../generated/client';
import { SubscriptionGuardService } from '../subscriptions/subscription-guard.service';
import logger from '../../lib/logger';

export class OrganizationService {
  private organizationRepository: OrganizationRepository;
  private subscriptionGuard: SubscriptionGuardService;

  constructor(subscriptionGuard?: SubscriptionGuardService) {
    this.organizationRepository = new OrganizationRepository();
    this.subscriptionGuard = subscriptionGuard || new SubscriptionGuardService();
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
  }) {
    // Phase S3: Subscription enforcement
    await this.subscriptionGuard.validateBusinessSubscription(params.businessId);

    const result = await this.organizationRepository.inviteUser(params);

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
