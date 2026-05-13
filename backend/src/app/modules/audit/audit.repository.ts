import { Prisma, AuditLog } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class AuditRepository {
  private prisma: Prisma.TransactionClient;

  constructor(tx?: Prisma.TransactionClient) {
    this.prisma = tx || prisma;
  }

  async create(data: Prisma.AuditLogUncheckedCreateInput): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data,
    });
  }

  async findAll(params: {
    businessId: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    skip: number;
    take: number;
  }) {
    const { businessId, entityType, entityId, userId, skip, take } = params;
    
    const where: Prisma.AuditLogWhereInput = { businessId };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      this.prisma.auditLog.count({ where })
    ]);

    return { items, total };
  }
}
