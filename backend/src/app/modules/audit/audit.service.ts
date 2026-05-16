import { AuditRepository } from './audit.repository';
import { Prisma } from '../../../generated/client';

export class AuditService {
  private auditRepo: AuditRepository;

  constructor() {
    this.auditRepo = new AuditRepository();
  }

  /**
   * Internal method to log actions with reliability checks
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
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    tx?: Prisma.TransactionClient;
  }) {
    // Reliability Check: Ensure businessId is always present
    if (!params.businessId) {
      console.warn(`[AuditService] Attempted to log action ${params.action} without businessId`);
      // In production, we might want to throw here, but for now we log a warning
    }

    const repo = params.tx ? new AuditRepository(params.tx) : this.auditRepo;
    
    try {
      return await repo.create({
        businessId: params.businessId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        previousData: params.previousData || Prisma.JsonNull,
        newData: params.newData || Prisma.JsonNull,
        changedFields: params.changedFields || Prisma.JsonNull,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        requestId: params.requestId,
      });
    } catch (error) {
      // Rule 5: Resilience. Audit logging failure should not break the main transaction
      // but we should log it to stdout/stderr.
      console.error('[AuditService] Failed to create audit log:', error);
      return null;
    }
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
