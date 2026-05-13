import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  const { user, accessToken, refreshToken } = result;

  // Set cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'User registered successfully',
    data: { user, accessToken },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  const { user, accessToken, refreshToken } = result;

  // Set cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully',
    data: { user, accessToken },
  });
});

const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError('Refresh token missing', 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(token);

  // Update cookies
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Token refreshed successfully',
    data: { accessToken },
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  
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
  refresh,
  logout,
};
