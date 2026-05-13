import { Request, Response } from 'express';
import { AuditService } from './audit.service';
import { sendResponse } from '../../shared/utils/sendResponse';
import { asyncHandler } from '../../../middleware/asyncHandler';

const auditService = new AuditService();

const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const businessId = (req as any).user.businessId;
  const { entityType, entityId, userId, page = 1, limit = 10 } = req.query;

  const result = await auditService.getAuditLogs({
    businessId,
    entityType: entityType as string,
    entityId: entityId as string,
    userId: userId as string,
    page: Number(page),
    limit: Number(limit),
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Audit logs retrieved successfully',
    data: result.items,
    meta: result.meta,
  });
});

export const AuditController = {
  getAuditLogs,
};
