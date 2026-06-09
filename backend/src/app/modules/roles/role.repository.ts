import { prisma } from '../../lib/prisma';
import { Prisma } from '../../../generated/client';

export class RoleRepository {
  /**
   * Find all custom roles for a business
   */
  async findAllCustom(businessId: string) {
    return await prisma.customRole.findMany({
      where: { businessId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find a custom role by ID
   */
  async findById(id: string, businessId: string) {
    return await prisma.customRole.findFirst({
      where: { id, businessId },
    });
  }

  /**
   * Find custom role by name (for uniqueness check)
   */
  async findByName(name: string, businessId: string) {
    return await prisma.customRole.findFirst({
      where: { name, businessId },
    });
  }

  /**
   * Create custom role
   */
  async create(data: Prisma.CustomRoleUncheckedCreateInput) {
    return await prisma.customRole.create({
      data,
    });
  }

  /**
   * Update custom role
   */
  async update(id: string, businessId: string, data: Prisma.CustomRoleUpdateInput) {
    return await prisma.customRole.update({
      where: { id, businessId },
      data,
    });
  }

  /**
   * Delete custom role
   */
  async delete(id: string, businessId: string) {
    return await prisma.customRole.delete({
      where: { id, businessId },
    });
  }
}
