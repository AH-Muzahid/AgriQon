import { Router } from 'express';
import { SecurityController } from './security.controller';
import { extractAuth, requireAuth, attachBusinessRole } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { ipRestrictions } from '../../middleware/security-gate.middleware';
import { authLimiter } from '../../../middleware/authRateLimiter';
import validateRequest from '../../middleware/validateRequest';
import { z } from 'zod';
import { BusinessRole, PlatformRole } from '../../../generated/client';
import { AppError } from '../../errors/AppError';
import { NextFunction, Response } from 'express';
import { AuthRequest } from '../../middleware/rbac.middleware';

const router = Router();

// Middleware to restrict access to OWNER or MANAGER roles for tenant business operations
const requireOwnerOrManager = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === PlatformRole.SUPER_ADMIN || req.user?.role === ('SUPER_ADMIN' as any) || req.user?.role === ('ADMIN' as any)) {
    return next();
  }
  if (req.businessRole === BusinessRole.OWNER || req.businessRole === BusinessRole.MANAGER) {
    return next();
  }
  next(new AppError('Forbidden. Requires business owner or manager access.', 403));
};

// ─── Public Endpoints (Verify Login) ─────────────────────────────────

// Endpoint to verify MFA code (TOTP or backup recovery code) during standard login flow
router.post(
  '/mfa/verify-login',
  authLimiter,
  validateRequest(
    z.object({
      body: z.object({
        mfaTempToken: z.string({ required_error: 'mfaTempToken is required' }),
        code: z.string({ required_error: 'Verification code is required' }).min(6).max(8),
      }),
    })
  ),
  SecurityController.verifyMFALogin
);

// ─── Protected Endpoints (Requires Authentication) ───────────────────
router.use(extractAuth, requireAuth);

// MFA Enrollment & Configuration
router.post('/mfa/setup', authLimiter, SecurityController.setupMFA);

router.post(
  '/mfa/verify-enable',
  authLimiter,
  validateRequest(
    z.object({
      body: z.object({
        code: z.string({ required_error: 'Verification code is required' }).min(6).max(8),
      }),
    })
  ),
  SecurityController.verifyAndEnableMFA
);

router.post(
  '/mfa/disable',
  authLimiter,
  validateRequest(
    z.object({
      body: z.object({
        code: z.string({ required_error: 'Verification code is required' }).min(6).max(8),
      }),
    })
  ),
  SecurityController.disableMFA
);

// Session & Device Management
router.get('/sessions', SecurityController.listSessions);
router.post('/sessions/:id/revoke', SecurityController.revokeSession);
router.post('/sessions/revoke-others', SecurityController.revokeAllOtherSessions);

// User Security Log / Login Activity
router.get('/login-activity', SecurityController.getLoginActivity);

// ─── Tenant-Scoped Rules (Requires Tenant context + OWNER/MANAGER role) ──
router.use(requireTenant, attachBusinessRole, requireOwnerOrManager);

router.get('/ip-rules', SecurityController.listIpRules);

router.post(
  '/ip-rules',
  validateRequest(
    z.object({
      body: z.object({
        ipRange: z.string({ required_error: 'ipRange is required' }).min(1),
        type: z.enum(['ALLOW', 'DENY'], { required_error: 'type must be ALLOW or DENY' }),
        description: z.string().optional(),
      }),
    })
  ),
  SecurityController.createIpRule
);

router.patch(
  '/ip-rules/:id',
  validateRequest(
    z.object({
      body: z.object({
        ipRange: z.string().optional(),
        type: z.enum(['ALLOW', 'DENY']).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    })
  ),
  SecurityController.updateIpRule
);

router.delete('/ip-rules/:id', SecurityController.deleteIpRule);

export const SecurityRoutes = router;
