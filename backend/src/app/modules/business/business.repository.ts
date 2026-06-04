import { Prisma, Business, PrismaClient } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class BusinessRepository {
  private prisma: PrismaClient;

  constructor(tx?: any) {
    this.prisma = (tx || prisma) as PrismaClient;
  }

  async create(data: Prisma.BusinessUncheckedCreateInput): Promise<Business> {
    return await this.prisma.business.create({
      data,
    });
  }

  async findById(id: string): Promise<Business | null> {
    return await this.prisma.business.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findAllByOrganization(organizationId: string): Promise<Business[]> {
    return await this.prisma.business.findMany({
      where: { organizationId, deletedAt: null },
    });
  }

  async findAll(): Promise<Business[]> {
    return await this.prisma.business.findMany({
      where: { deletedAt: null },
    });
  }

  async update(id: string, data: Prisma.BusinessUncheckedUpdateInput): Promise<Business> {
    return await this.prisma.business.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Business> {
    return await this.prisma.business.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
