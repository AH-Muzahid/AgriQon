import { NextFunction, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ipMatchesCIDR } from '../shared/utils/cidr';
import { AppError } from '../errors/AppError';
import catchAsync from '../shared/utils/catchAsync';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware to restrict requests based on tenant-specific BusinessIpRule configurations.
 */
export const ipRestrictions = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.user?.businessId;
  // If request is not associated with a specific business tenant, bypass IP checking.
  if (!businessId) {
    return next();
  }

  // Get client IP address
  const rawIp = req.ip || req.socket.remoteAddress || '';
  const clientIp = Array.isArray(rawIp) ? rawIp[0] : rawIp;

  // Retrieve active IP rules for the tenant
  const rules = await prisma.businessIpRule.findMany({
    where: {
      businessId,
      isActive: true,
    },
  });

  // If no rules are configured, let the request pass
  if (rules.length === 0) {
    return next();
  }

  const allowRules = rules.filter((r) => r.type === 'ALLOW');
  const denyRules = rules.filter((r) => r.type === 'DENY');

  // 1. Check if client IP is blacklisted (DENY rules)
  for (const rule of denyRules) {
    if (ipMatchesCIDR(clientIp, rule.ipRange)) {
      throw new AppError('Access denied: Your IP address is blocked by this business tenant.', 403);
    }
  }

  // 2. Check if client IP is whitelisted (ALLOW rules)
  if (allowRules.length > 0) {
    let isAllowed = false;
    for (const rule of allowRules) {
      if (ipMatchesCIDR(clientIp, rule.ipRange)) {
        isAllowed = true;
        break;
      }
    }
    if (!isAllowed) {
      throw new AppError('Access denied: Your IP address is not whitelisted by this business tenant.', 403);
    }
  }

  next();
});
