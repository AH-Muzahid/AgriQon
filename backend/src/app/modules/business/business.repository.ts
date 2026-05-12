import { Prisma, Business } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class BusinessRepository {
  async create(data: Prisma.BusinessUncheckedCreateInput): Promise<Business> {
    return await prisma.business.create({
      data,
    });
  }

  async findById(id: string): Promise<Business | null> {
    return await prisma.business.findUnique({
      where: { id },
    });
  }

  async findAllByOrganization(organizationId: string): Promise<Business[]> {
    return await prisma.business.findMany({
      where: { organizationId },
    });
  }
}
