import { prisma } from '../../lib/prisma';
import { BusinessRole } from '../../../generated/client';

export class OrganizationRepository {
  /**
   * Find all users within a business along with their roles and custom roles
   */
  async findBusinessUsers(businessId: string) {
    return await prisma.userBusinessRole.findMany({
      where: { businessId },
      include: {
        user: {
          include: {
            customRoles: {
              include: {
                customRole: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create user and role mapping transactionally for invitation
   */
  async inviteUser(params: {
    email: string;
    name: string;
    role: BusinessRole;
    businessId: string;
  }) {
    const { email, name, role, businessId } = params;

    return await prisma.$transaction(async (tx: any) => {
      // Find existing user or create a new one (invited users have null password initially)
      let user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            email,
            name,
            role: 'USER', // default platform role
            businessId,
          },
        });
      }

      // Upsert user business role relation
      const ubr = await tx.userBusinessRole.upsert({
        where: {
          userId_businessId: {
            userId: user.id,
            businessId,
          },
        },
        update: {
          role,
        },
        create: {
          userId: user.id,
          businessId,
          role,
        },
      });

      return { user, role: ubr.role };
    });
  }

  async revokeUser(userId: string, businessId: string) {
    return await prisma.userBusinessRole.delete({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });
  }

  async updateUserRole(userId: string, businessId: string, role: BusinessRole) {
    return await prisma.userBusinessRole.update({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
      data: {
        role,
      },
    });
  }
}
