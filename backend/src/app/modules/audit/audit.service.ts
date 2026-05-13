import { AuditRepository } from './audit.repository';
import { Prisma } from '../../../generated/client';

export class AuditService {
  private auditRepo: AuditRepository;

  constructor() {
    this.auditRepo = new AuditRepository();
  }

  /**
   * Internal method to log actions
   */
  async log(params: {
    businessId: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId: string;
    previousData?: any;
    newData?: any;
    changedFields?: any;
    tx?: Prisma.TransactionClient;
  }) {
    const repo = params.tx ? new AuditRepository(params.tx) : this.auditRepo;
    return repo.create({
      businessId: params.businessId,
      userId: params.userId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      previousData: params.previousData || Prisma.JsonNull,
      newData: params.newData || Prisma.JsonNull,
      changedFields: params.changedFields || Prisma.JsonNull,
    });
  }

  async getAuditLogs(params: {
    businessId: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const { items, total } = await this.auditRepo.findAll({
      ...params,
      skip,
      take: params.limit,
    });

    return {
      items,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
      },
    };
  }
}
