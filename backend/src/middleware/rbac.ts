import { Role } from '../generated/client';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../app/lib/logger';
import { env } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email?: string;
    businessId?: string | null;
  };
}

/**
 * Middleware to extract and verify JWT from Authorization header
 */
export const extractAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // If no bearer token, attempt to read authToken or accessToken cookie
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map((c) => c.trim());
    const match = cookies.find((c) => c.startsWith('authToken=') || c.startsWith('accessToken='));
    if (match) {
      token = decodeURIComponent(match.split('=')[1]);
    }
  }

  if (!token) return next();

  try {
    const jwtSecret = env.jwtSecret || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }) as any;

    req.user = {
      id: decoded.sub || decoded.id,
      role: decoded.role || 'USER',
      email: decoded.email,
      businessId: decoded.businessId,
    };
  } catch (err: any) {
    // Token invalid, continue as anonymous but log for debugging
    logger.debug('RBAC: invalid token or token verify failed', { path: req.path, ip: req.ip, message: err?.message });
    return next();
  }

  next();
};

/**
 * Middleware to check user role(s)
 * Usage: authorize('SELLER', 'ADMIN')
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please login.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden. Required role: ${allowedRoles.join(' or ')}` 
      });
    }

    next();
  };
};

/**
 * Middleware to require authentication
 */
export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. Please login.' });
  }
  next();
};

/**
 * Check if user owns a resource (for ownership validation)
 */
export const checkOwnership = (userId: string, req: AuthRequest): boolean => {
  if (!req.user) return false;
  return req.user.id === userId;
};

/**
 * Check if user is admin
 */
export const isAdmin = (req: AuthRequest): boolean => {
  return req.user?.role === 'ADMIN';
};

/**
 * Check if user is seller
 */
export const isSeller = (req: AuthRequest): boolean => {
  return req.user?.role === 'SELLER' || req.user?.role === 'ADMIN';
};
