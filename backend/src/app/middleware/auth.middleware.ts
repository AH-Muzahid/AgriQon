import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../errors/AppError';
import catchAsync from '../shared/utils/catchAsync';
import { Role, PlatformRole } from '../../generated/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role | PlatformRole;
    email?: string;
    businessId?: string | null;
    organizationId?: string | null;
  };
}

export const auth = (...roles: (Role | PlatformRole)[]) => {
  return catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Fallback to cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    // 3. Verification
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch (error) {
      throw new AppError('Invalid token. Please log in again.', 401);
    }

    // 4. Set user to request
    req.user = {
      id: decoded.id || decoded.sub,
      role: decoded.role,
      email: decoded.email,
      businessId: decoded.businessId,
      organizationId: decoded.organizationId,
    };

    // 5. Authorization
    if (roles.length && !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }

    next();
  });
};
