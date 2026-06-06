import jwt from 'jsonwebtoken';
import { extractAuth, attachBusinessRole, authorizeAny, authorizeAll, AuthRequest } from '../rbac.middleware';
import { Response, NextFunction } from 'express';
import { AppError } from '../../errors/AppError';
import { prisma } from '../../lib/prisma';
import { PermissionService } from '../../services/permission.service';
import { PlatformRole, BusinessRole } from '../../../generated/client';

jest.mock('jsonwebtoken');
jest.mock('../../lib/prisma', () => ({
  prisma: {
    userBusinessRole: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock('../../services/permission.service');

describe('RBAC Middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn() as any;
    jest.clearAllMocks();
  });

  describe('extractAuth', () => {
    it('should extract and verify user from Bearer token', () => {
      req.headers!.authorization = 'Bearer valid-token';
      const decodedUser = { sub: 'user-1', role: PlatformRole.SELLER, email: 'seller@test.com' };
      (jwt.verify as jest.Mock).mockReturnValue(decodedUser);

      extractAuth(req as AuthRequest, res as Response, next);

      expect(req.user).toEqual({
        id: 'user-1',
        role: PlatformRole.SELLER,
        email: 'seller@test.com',
        businessId: undefined,
        organizationId: undefined,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should extract and verify user from cookie', () => {
      req.cookies!.authToken = 'cookie-token';
      const decodedUser = { sub: 'user-2', role: PlatformRole.USER };
      (jwt.verify as jest.Mock).mockReturnValue(decodedUser);

      extractAuth(req as AuthRequest, res as Response, next);

      expect(req.user).toEqual({
        id: 'user-2',
        role: PlatformRole.USER,
        email: undefined,
        businessId: undefined,
        organizationId: undefined,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should call next and not set req.user if no token provided', () => {
      extractAuth(req as AuthRequest, res as Response, next);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('attachBusinessRole', () => {
    it('should fetch and attach role if userId and businessId are present', async () => {
      req.user = { id: 'user-1', role: PlatformRole.SELLER };
      req.businessId = 'biz-1';
      
      (prisma.userBusinessRole.findUnique as jest.Mock).mockResolvedValue({
        role: BusinessRole.MANAGER,
      });

      await attachBusinessRole(req as AuthRequest, res as Response, next);

      expect(req.businessRole).toBe(BusinessRole.MANAGER);
      expect(next).toHaveBeenCalled();
    });

    it('should fail closed with 403 AppError if DB lookup throws an error', async () => {
      req.user = { id: 'user-1', role: PlatformRole.SELLER };
      req.businessId = 'biz-1';

      (prisma.userBusinessRole.findUnique as jest.Mock).mockRejectedValue(new Error('DB connection lost'));

      await attachBusinessRole(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(new AppError('RBAC role lookup failed. Access denied.', 403));
    });
  });

  describe('authorizeAny', () => {
    it('should pass if user has the required permission', async () => {
      req.user = { id: 'user-1', role: PlatformRole.SELLER };
      req.businessRole = BusinessRole.MANAGER;

      (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue(['product.view', 'inventory.view']);

      const middleware = authorizeAny('product.view' as any, 'product.create' as any);
      await middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 AppError if user lacks all required permissions', async () => {
      req.user = { id: 'user-1', role: PlatformRole.SELLER };
      req.businessRole = BusinessRole.STAFF;

      (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue(['product.view']);

      const middleware = authorizeAny('product.create' as any);
      await middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(new AppError('Forbidden. Requires one of: product.create', 403));
    });

    it('should return 401 AppError if user is not authenticated', async () => {
      const middleware = authorizeAny('product.view' as any);
      await middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(new AppError('Unauthorized. Please login.', 401));
    });
  });

  describe('authorizeAll', () => {
    it('should pass if user has all of the required permissions', async () => {
      req.user = { id: 'user-1', role: PlatformRole.SELLER };
      req.businessRole = BusinessRole.MANAGER;

      (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue(['inventory.view', 'inventory.update']);

      const middleware = authorizeAll('inventory.view' as any, 'inventory.update' as any);
      await middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 AppError if user lacks one of the required permissions', async () => {
      req.user = { id: 'user-1', role: PlatformRole.SELLER };
      req.businessRole = BusinessRole.STAFF;

      (PermissionService.getPermissionsForRole as jest.Mock).mockResolvedValue(['inventory.view']);

      const middleware = authorizeAll('inventory.view' as any, 'inventory.update' as any);
      await middleware(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(
        new AppError('Forbidden. Requires all of: inventory.view, inventory.update', 403),
      );
    });
  });
});
