import { Prisma, Business } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class BusinessRepository {
  async create(data: Prisma.BusinessUncheckedCreateInput): Promise<Business> {
    return await prisma.business.create({
      data,
    });
  }

  async findById(id: string): Promise<Business | null> {
    return await prisma.business.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findAllByOrganization(organizationId: string): Promise<Business[]> {
    return await prisma.business.findMany({
      where: { organizationId, deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.BusinessUncheckedUpdateInput): Promise<Business> {
    return await prisma.business.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Business> {
    return await prisma.business.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
