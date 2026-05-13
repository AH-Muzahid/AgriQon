import { Role, User } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class RoleRepository {
  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: Role): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Find users by role
   */
  async findUsersByRole(role: Role): Promise<User[]> {
    return await prisma.user.findMany({
      where: { 
        role,
        deletedAt: null 
      },
    });
  }

  /**
   * Find users by business and role
   */
  async findUsersByBusinessAndRole(businessId: string, role: Role): Promise<User[]> {
    return await prisma.user.findMany({
      where: {
        businessId,
        role,
        deletedAt: null
      },
    });
  }
}
