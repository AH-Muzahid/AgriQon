import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  const { user, token } = result;

  // Set cookie
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully',
    data: { user, token },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  const { user, token } = result;

  // Set cookie
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: { user, token },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('authToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged out successfully',
    data: null,
  });
});

export const AuthController = {
  register,
  login,
  logout,
};
