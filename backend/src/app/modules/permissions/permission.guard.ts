import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AppError } from '../../errors/AppError';
import { Permission, hasPermission } from './permissions';

/**
 * Permission Guard
 * ──────────────────────────────────────────────────────────────────────────
 * Middleware to check if the authenticated user has a specific permission.
 * Must be used AFTER the auth middleware.
 * 
 * Usage:
 * router.post('/', auth(), checkPermission(Permission.ORDERS_CREATE), controller.create);
 */
export const checkPermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError('You are not logged in.', 401);
    }

    if (!hasPermission(user.role, permission)) {
      throw new AppError(`Forbidden: You do not have permission to ${permission.replace(':', ' ')}`, 403);
    }

    next();
  };
};
