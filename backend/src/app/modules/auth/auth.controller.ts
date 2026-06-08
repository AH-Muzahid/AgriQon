import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AppError } from '../../errors/AppError';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { prisma } from '../../lib/prisma';
import { PermissionService } from '../../services/permission.service';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

async function enrichUser(user: any) {
  if (!user) return user;
  let businessRole = 'STAFF';
  let permissions: string[] = [];
  
  if (user.businessId) {
    const ubr = await prisma.userBusinessRole.findUnique({
      where: {
        userId_businessId: {
          userId: user.id,
          businessId: user.businessId
        }
      }
    });
    if (ubr) {
      businessRole = ubr.role;
      permissions = await PermissionService.getPermissionsForRole(ubr.role);
    }
  }
  
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    businessRole,
    permissions
  };
}

const register = catchAsync(async (req: Request, res: Response) => {
  const sessionInfo = {
    ip: req.ip,
    ua: req.headers['user-agent']
  };
  const result = await authService.register(req.body, sessionInfo);
  const { user, accessToken, refreshToken } = result;
  const enrichedUser = await enrichUser(user);

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
    data: { user: enrichedUser, accessToken },
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const sessionInfo = {
    ip: req.ip,
    ua: req.headers['user-agent']
  };
  const result = await authService.login(req.body, sessionInfo);
  const { user, accessToken, refreshToken } = result;
  const enrichedUser = await enrichUser(user);

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
    data: { user: enrichedUser, accessToken },
  });
});

const refresh = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new AppError('Refresh token missing', 401);
  }

  const sessionInfo = {
    ip: req.ip,
    ua: req.headers['user-agent']
  };

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(token, sessionInfo);

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

const oauthCallback = catchAsync(async (req: Request, res: Response) => {
  const sessionInfo = {
    ip: req.ip,
    ua: req.headers['user-agent']
  };
  const result = await authService.oauthCallback(req.body, sessionInfo);
  const { user, accessToken, refreshToken } = result;
  const enrichedUser = await enrichUser(user);

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
    message: 'User authenticated with OAuth successfully',
    data: { user: enrichedUser, accessToken },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const enrichedUser = await enrichUser(user);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'User profile retrieved successfully',
    data: enrichedUser,
  });
});

export const AuthController = {
  register,
  login,
  refresh,
  logout,
  oauthCallback,
  getMe,
};
