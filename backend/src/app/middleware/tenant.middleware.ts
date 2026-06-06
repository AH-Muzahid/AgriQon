import { Response, NextFunction } from 'express';
import { AuthRequest } from './rbac.middleware';
import { AppError } from '../errors/AppError';

/**
 * Middleware to extract and validate businessId for multi-tenant isolation.
 * Should be used after extractAuth middleware.
 */
export const requireTenant = (req: AuthRequest, res: Response, next: NextFunction) => {
  const businessId = req.headers['x-business-id'] as string || req.user?.businessId;

  if (!businessId) {
    if (!req.user) {
      return next(new AppError('Unauthorized. Please login.', 401));
    }
    return next(new AppError('Business Context (businessId) is required for this operation', 400));
  }

  // Inject businessId into request for easy access in controllers/services
  req.businessId = businessId;
  
  next();
};

// Extend AuthRequest to include businessId
declare module './rbac.middleware' {
  interface AuthRequest {
    businessId?: string;
  }
}
