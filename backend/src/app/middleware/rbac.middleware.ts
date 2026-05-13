import { Role } from '../../generated/client';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../errors/AppError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email?: string;
    businessId?: string | null;
    organizationId?: string | null;
  };
  businessId?: string; // For tenant context
}

/**
 * Middleware to extract and verify JWT
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
      role: (decoded.role as Role) || Role.USER,
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

/**
 * Middleware to require specific roles
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Unauthorized. Please login.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(`Forbidden. Required role: ${allowedRoles.join(' or ')}`, 403);
    }

    next();
  };
};

/**
 * Require basic authentication
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError('Unauthorized. Please login.', 401);
  }
  next();
};
