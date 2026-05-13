import jwt from 'jsonwebtoken';
import { auth, AuthRequest } from '../../app/middleware/auth.middleware';
import { Response, NextFunction } from 'express';
import { AppError } from '../../app/errors/AppError';
import { env } from '../../config/env';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next with 401 if no token is provided in header or cookie', async () => {
    const middleware = auth();
    
    await middleware(req as AuthRequest, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe('You are not logged in. Please log in to get access.');
    expect(error.statusCode).toBe(401);
  });

  it('should call next with 401 if token is invalid', async () => {
    req.headers!.authorization = 'Bearer invalid-token';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const middleware = auth();
    await middleware(req as AuthRequest, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe('Invalid token. Please log in again.');
    expect(error.statusCode).toBe(401);
  });

  it('should set user on request if token is valid', async () => {
    const mockUser = {
      id: 'user-123',
      role: 'ADMIN',
      email: 'admin@test.com',
      businessId: 'biz-123',
    };
    
    req.headers!.authorization = 'Bearer valid-token';
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    const middleware = auth();
    await middleware(req as AuthRequest, res as Response, next);

    expect(req.user).toEqual({
      id: mockUser.id,
      role: mockUser.role,
      email: mockUser.email,
      businessId: mockUser.businessId,
      organizationId: undefined,
    });
    expect(next).toHaveBeenCalled();
  });

  it('should call next with 403 if user role is not authorized', async () => {
    const mockUser = {
      id: 'user-123',
      role: 'USER',
      email: 'user@test.com',
    };
    
    req.headers!.authorization = 'Bearer valid-token';
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    // auth() takes allowed roles
    const middleware = auth('ADMIN' as any);
    await middleware(req as AuthRequest, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(error.message).toBe('You do not have permission to perform this action');
    expect(error.statusCode).toBe(403);
  });

  it('should succeed if user has one of the allowed roles', async () => {
    const mockUser = {
      id: 'user-123',
      role: 'MANAGER',
    };
    
    req.headers!.authorization = 'Bearer valid-token';
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);

    const middleware = auth('ADMIN' as any, 'MANAGER' as any);
    await middleware(req as AuthRequest, res as Response, next);

    expect(next).toHaveBeenCalled();
  });
});
