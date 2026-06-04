import { PlatformRole, BusinessRole, Role } from '../../generated/client';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../errors/AppError';
import { prisma } from '../lib/prisma';
import { PermissionKey } from '../constants/permissions';
import { PermissionService } from '../services/permission.service';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: PlatformRole | Role;
    email?: string;
    businessId?: string | null;
    organizationId?: string | null;
  };
  businessId?: string; // For tenant context (set by requireTenant)
  businessRole?: BusinessRole; // Attached by attachBusinessRole
}

// ─── JWT Extraction ──────────────────────────────────────────────────

/**
 * Middleware to extract and verify JWT (platform role only).
 * Supports both Bearer token and HttpOnly cookie transport.
 * Does NOT enforce authentication — use requireAuth for that.
 */
export const extractAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token && req.cookies?.authToken) {
    token = req.cookies.authToken;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as any;

    req.user = {
      id: decoded.sub || decoded.id,
      role: (decoded.role as PlatformRole) || PlatformRole.USER,
      email: decoded.email,
      businessId: decoded.businessId,
      organizationId: decoded.organizationId,
    };
  } catch (err) {
    // Continue as guest if token is invalid but present
    return next();
  }

  next();
};

// ─── Business Role Attachment ────────────────────────────────────────

/**
 * Middleware to fetch the user's BusinessRole from the UserBusinessRole table
 * and attach it to req.businessRole.
 *
 * Must run AFTER extractAuth and requireTenant so that req.user and
 * req.businessId are available.
 *
 * FAIL-CLOSED: If the DB lookup fails, the request is rejected with 403.
 * If the user simply has no role for this business, req.businessRole
 * remains undefined and downstream guards (authorizeAny/All) will reject.
 */
export const attachBusinessRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.id;
  const businessId = req.businessId || (req.user?.businessId ?? undefined);

  if (!userId || !businessId) {
    // No user or no tenant context — skip; downstream requireAuth/authorize will catch
    return next();
  }

  try {
    const userBusinessRole = await prisma.userBusinessRole.findUnique({
      where: {
        userId_businessId: { userId, businessId },
      },
      select: { role: true },
    });

    if (userBusinessRole) {
      req.businessRole = userBusinessRole.role;
    }

    next();
  } catch (err) {
    // FAIL CLOSED — RBAC lookup errors must not silently pass through
    throw new AppError('RBAC role lookup failed. Access denied.', 403);
  }
};

// ─── Require Authentication ──────────────────────────────────────────

/**
 * Require basic authentication (user must be logged in).
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Unauthorized. Please login.', 401);
  }
  next();
};

// ─── Permission-Based Authorization ─────────────────────────────────

/**
 * Authorize if the user's business role has ANY ONE of the listed permissions.
 * Usage: `authorizeAny('product.view', 'product.manage')`
 */
export const authorizeAny = (...requiredPermissions: PermissionKey[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    assertAuthAndRole(req);

    try {
      const grantedKeys = await PermissionService.getPermissionsForRole(req.businessRole!);
      const grantedSet = new Set(grantedKeys);

      const hasSome = requiredPermissions.some((key) => grantedSet.has(key));
      if (!hasSome) {
        throw new AppError(
          `Forbidden. Requires one of: ${requiredPermissions.join(', ')}`,
          403,
        );
      }

      next();
    } catch (err) {
      if (err instanceof AppError) throw err;
      // Fail closed on unexpected errors
      throw new AppError('Permission check failed. Access denied.', 403);
    }
  };
};

/**
 * Authorize if the user's business role has ALL of the listed permissions.
 * Usage: `authorizeAll('inventory.view', 'inventory.update')`
 */
export const authorizeAll = (...requiredPermissions: PermissionKey[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    assertAuthAndRole(req);

    try {
      const grantedKeys = await PermissionService.getPermissionsForRole(req.businessRole!);
      const grantedSet = new Set(grantedKeys);

      const hasAll = requiredPermissions.every((key) => grantedSet.has(key));
      if (!hasAll) {
        throw new AppError(
          `Forbidden. Requires all of: ${requiredPermissions.join(', ')}`,
          403,
        );
      }

      next();
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Permission check failed. Access denied.', 403);
    }
  };
};

// ─── Internal Helpers ────────────────────────────────────────────────

/**
 * Shared pre-check for authorization middleware.
 * Ensures the user is authenticated and has a business role attached.
 */
function assertAuthAndRole(req: AuthRequest): void {
  if (!req.user) {
    throw new AppError('Unauthorized. Please login.', 401);
  }
  if (!req.businessRole) {
    throw new AppError('Forbidden. No business role assigned.', 403);
  }
}

// ─── Backward Compatibility ─────────────────────────────────────────

/**
 * @deprecated Use `authorizeAny` or `authorizeAll` with PermissionKey strings.
 * This alias exists solely to prevent build breakage while routes are migrated.
 * It accepts any strings and delegates to authorizeAny.
 */
export const authorize = (...keys: any[]) => authorizeAny(...(keys as PermissionKey[]));
