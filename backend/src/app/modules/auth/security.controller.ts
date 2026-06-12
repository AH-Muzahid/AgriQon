import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { SecurityService } from './security.service';
import { AuthService } from './auth.service';
import { UserRepository } from './user.repository';
import { AppError } from '../../errors/AppError';

const securityService = new SecurityService();
const userRepository = new UserRepository();
const authService = new AuthService(userRepository);

const setupMFA = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const email = req.user?.email;
  if (!userId || !email) {
    throw new AppError('Unauthorized', 401);
  }
  const result = await securityService.setupMFA(userId, email);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'MFA setup initialized successfully',
    data: result,
  });
});

const verifyAndEnableMFA = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  const result = await securityService.verifyAndEnableMFA(userId, req.body.code);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'MFA enabled successfully',
    data: result,
  });
});

const disableMFA = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  const result = await securityService.disableMFA(userId, req.body.code);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'MFA disabled successfully',
    data: result,
  });
});

const verifyMFALogin = catchAsync(async (req: Request, res: Response) => {
  const sessionInfo = {
    ip: req.ip,
    ua: req.headers['user-agent'],
  };
  const { mfaTempToken, code } = req.body;
  if (!mfaTempToken || !code) {
    throw new AppError('MFA token and verification code are required', 400);
  }

  const result = await authService.verifyMFALogin({ mfaTempToken, code }, sessionInfo);
  const { user, accessToken, refreshToken } = result;

  // Set cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'MFA verification successful, user logged in',
    data: { user, accessToken },
  });
});

const listSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  const result = await authService.listSessions(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Active sessions retrieved successfully',
    data: result,
  });
});

const revokeSession = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  await authService.revokeSession(userId, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Session revoked successfully',
    data: null,
  });
});

const revokeAllOtherSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }

  let currentToken = req.cookies?.refreshToken;
  if (!currentToken && req.headers.authorization?.startsWith('Bearer ')) {
    currentToken = req.headers.authorization.substring(7);
  }

  if (!currentToken) {
    throw new AppError('Current session token is missing', 400);
  }

  await authService.revokeAllOtherSessions(userId, currentToken);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All other sessions revoked successfully',
    data: null,
  });
});

const getLoginActivity = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('Unauthorized', 401);
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const result = await securityService.getLoginActivity(userId, page, limit);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Login activity retrieved successfully',
    data: result,
  });
});

const listIpRules = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) {
    throw new AppError('Forbidden: Request is not scoped to a tenant business', 403);
  }
  const result = await securityService.listIpRules(businessId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'IP rules retrieved successfully',
    data: result,
  });
});

const createIpRule = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) {
    throw new AppError('Forbidden: Request is not scoped to a tenant business', 403);
  }
  const result = await securityService.createIpRule(businessId, req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'IP rule created successfully',
    data: result,
  });
});

const updateIpRule = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) {
    throw new AppError('Forbidden: Request is not scoped to a tenant business', 403);
  }
  const result = await securityService.updateIpRule(businessId, req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'IP rule updated successfully',
    data: result,
  });
});

const deleteIpRule = catchAsync(async (req: Request, res: Response) => {
  const businessId = req.user?.businessId;
  if (!businessId) {
    throw new AppError('Forbidden: Request is not scoped to a tenant business', 403);
  }
  const result = await securityService.deleteIpRule(businessId, req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'IP rule deleted successfully',
    data: result,
  });
});

export const SecurityController = {
  setupMFA,
  verifyAndEnableMFA,
  disableMFA,
  verifyMFALogin,
  listSessions,
  revokeSession,
  revokeAllOtherSessions,
  getLoginActivity,
  listIpRules,
  createIpRule,
  updateIpRule,
  deleteIpRule,
};
