import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../app/lib/logger';
import type { Role, PlatformRole } from '../generated/client';
import { env } from '../config/env';

export type AuthUser = {
  id: string;
  role: Role | PlatformRole;
  email?: string;
  businessId?: string | null;
  organizationId?: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Support Authorization header or authToken cookie
  let token: string | undefined;
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  }

  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').map((c) => c.trim());
    // Accept either `authToken` or `accessToken` cookie names (some flows use accessToken)
    const match = cookies.find((c) => c.startsWith('authToken=') || c.startsWith('accessToken='));
    if (match) token = decodeURIComponent(match.split('=')[1]);
  }

  if (!token) {
    logger.warn('Missing bearer token', { path: req.path, ip: req.ip });
    return res.status(401).json({ message: 'Missing bearer token' });
  }

  if (!env.jwtSecret) {
    return res.status(500).json({ message: 'Server misconfiguration: JWT secret missing' });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] }) as AuthUser;
    return next();
  } catch (err: any) {
    logger.warn('Invalid or expired token', { path: req.path, ip: req.ip, message: err?.message });
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorize =
  (...roles: (Role | PlatformRole)[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
