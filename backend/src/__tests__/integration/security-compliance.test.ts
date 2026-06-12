import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { ipMatchesCIDR } from '../../app/shared/utils/cidr';
import globalErrorHandler from '../../app/middleware/error.middleware';
import { env } from '../../config/env';
import { SecurityRoutes } from '../../app/modules/auth/security.routes';
import { AuthRoutes } from '../../app/modules/auth/auth.routes';
import { encrypt } from '../../app/shared/utils/encryption';

// Mock DB Operations
const mockUserFindUnique = jest.fn();
const mockUserFindById = jest.fn();
const mockUserUpdate = jest.fn();
const mockLoginActivityCreate = jest.fn();
const mockLoginActivityFindMany = jest.fn();
const mockLoginActivityCount = jest.fn();
const mockBusinessIpRuleFindMany = jest.fn();
const mockBusinessIpRuleFindFirst = jest.fn();
const mockBusinessIpRuleCreate = jest.fn();
const mockBusinessIpRuleUpdate = jest.fn();
const mockBusinessIpRuleDelete = jest.fn();
const mockRefreshTokenCreate = jest.fn();
const mockRefreshTokenFindMany = jest.fn();
const mockRefreshTokenFindFirst = jest.fn();
const mockRefreshTokenFindUnique = jest.fn();
const mockRefreshTokenUpdate = jest.fn();
const mockRefreshTokenUpdateMany = jest.fn();
const mockUserBusinessRoleFindUnique = jest.fn();
const mockAuditLogCreate = jest.fn();

jest.mock('../../app/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
      update: (...args: any[]) => mockUserUpdate(...args),
    },
    loginActivity: {
      create: (...args: any[]) => mockLoginActivityCreate(...args),
      findMany: (...args: any[]) => mockLoginActivityFindMany(...args),
      count: (...args: any[]) => mockLoginActivityCount(...args),
    },
    businessIpRule: {
      findMany: (...args: any[]) => mockBusinessIpRuleFindMany(...args),
      findFirst: (...args: any[]) => mockBusinessIpRuleFindFirst(...args),
      create: (...args: any[]) => mockBusinessIpRuleCreate(...args),
      update: (...args: any[]) => mockBusinessIpRuleUpdate(...args),
      delete: (...args: any[]) => mockBusinessIpRuleDelete(...args),
    },
    refreshToken: {
      create: (...args: any[]) => mockRefreshTokenCreate(...args),
      findMany: (...args: any[]) => mockRefreshTokenFindMany(...args),
      findFirst: (...args: any[]) => mockRefreshTokenFindFirst(...args),
      findUnique: (...args: any[]) => mockRefreshTokenFindUnique(...args),
      update: (...args: any[]) => mockRefreshTokenUpdate(...args),
      updateMany: (...args: any[]) => mockRefreshTokenUpdateMany(...args),
    },
    userBusinessRole: {
      findUnique: (...args: any[]) => mockUserBusinessRoleFindUnique(...args),
    },
    auditLog: {
      create: (...args: any[]) => mockAuditLogCreate(...args),
    },
  },
}));

// Mock UserRepository - must match what AuthService constructor expects
jest.mock('../../app/modules/auth/user.repository', () => {
  return {
    UserRepository: jest.fn().mockImplementation(() => {
      return {
        findByEmail: (...args: any[]) => mockUserFindUnique(...args),
        findById: (...args: any[]) => mockUserFindById(...args),
        create: jest.fn(),
        createRefreshToken: (...args: any[]) => mockRefreshTokenCreate(...args),
        findRefreshToken: (...args: any[]) => mockRefreshTokenFindUnique(...args),
        revokeRefreshToken: (...args: any[]) => mockRefreshTokenUpdate(...args),
        revokeTokenFamily: (...args: any[]) => mockRefreshTokenUpdateMany(...args),
        revokeAllRefreshTokensForUser: (...args: any[]) => mockRefreshTokenUpdateMany(...args),
      };
    }),
  };
});

describe('Phase S13 — Enterprise Security & Compliance', () => {
  let app: express.Express;
  const mockJwtSecret = 'test-security-secret-key';

  beforeAll(() => {
    env.jwtSecret = mockJwtSecret;

    app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.use('/api/v1/auth', AuthRoutes);
    app.use('/api/v1/security', SecurityRoutes);

    app.use(globalErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: loginActivity.create always resolves
    mockLoginActivityCreate.mockResolvedValue({});
    mockUserUpdate.mockResolvedValue({});
    mockRefreshTokenCreate.mockResolvedValue({});
  });

  // ─── 1. CIDR Range Matching ────────────────────────────────────────────

  describe('1. CIDR Ranges & IP Matching', () => {
    it('should correctly match exact IPv4 addresses', () => {
      expect(ipMatchesCIDR('192.168.1.1', '192.168.1.1')).toBe(true);
      expect(ipMatchesCIDR('192.168.1.1', '192.168.1.2')).toBe(false);
    });

    it('should match client IP inside CIDR subnet range', () => {
      expect(ipMatchesCIDR('192.168.1.15', '192.168.1.0/24')).toBe(true);
      expect(ipMatchesCIDR('10.5.4.3', '10.0.0.0/8')).toBe(true);
      expect(ipMatchesCIDR('192.168.2.1', '192.168.1.0/24')).toBe(false);
    });

    it('should handle IPv6-mapped IPv4 loopback addresses', () => {
      expect(ipMatchesCIDR('::1', '127.0.0.1')).toBe(true);
      expect(ipMatchesCIDR('::ffff:127.0.0.1', '127.0.0.1')).toBe(true);
    });

    it('should handle /0 and /32 edge cases', () => {
      expect(ipMatchesCIDR('1.2.3.4', '0.0.0.0/0')).toBe(true); // /0 matches everything
      expect(ipMatchesCIDR('10.0.0.1', '10.0.0.1/32')).toBe(true); // /32 exact match
      expect(ipMatchesCIDR('10.0.0.2', '10.0.0.1/32')).toBe(false);
    });

    it('should return false for malformed input', () => {
      expect(ipMatchesCIDR('not-an-ip', '192.168.1.0/24')).toBe(false);
      expect(ipMatchesCIDR('192.168.1.1', 'garbage')).toBe(false);
    });
  });

  // ─── 2. Account Lockout Policy ─────────────────────────────────────────

  describe('2. Account Lockout Policy', () => {
    it('should block logins if lockedUntil is in the future', async () => {
      const lockedUser = {
        id: 'user-locked-1',
        email: 'locked@example.com',
        password: 'hashedpassword',
        mfaEnabled: false,
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
        failedLoginAttempts: 5,
      };

      mockUserFindUnique.mockResolvedValue(lockedUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'locked@example.com', password: 'password123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Account is temporarily locked');
      expect(mockLoginActivityCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'LOCKED' }),
        })
      );
    });

    it('should increment failedLoginAttempts on wrong password', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        password: '$2a$12$hashedpasswordthatdoesntmatch',
        mfaEnabled: false,
        failedLoginAttempts: 2,
        lockedUntil: null,
      };

      mockUserFindUnique.mockResolvedValue(user);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(mockUserUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ failedLoginAttempts: 3 }),
        })
      );
      expect(mockLoginActivityCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED_PASSWORD' }),
        })
      );
    });
  });

  // ─── 3. MFA TOTP Flows ─────────────────────────────────────────────────

  describe('3. MFA TOTP Authentication', () => {
    it('should return mfaRequired + mfaTempToken if MFA is enabled', async () => {
      const mfaUser = {
        id: 'user-mfa-1',
        email: 'mfa@example.com',
        password: '$2a$12$realhashedpasswordgoeshere',
        mfaEnabled: true,
        mfaSecret: encrypt('TESTBASE32SECRET'),
        failedLoginAttempts: 0,
        lockedUntil: null,
      };

      mockUserFindUnique.mockResolvedValue(mfaUser);
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'mfa@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.mfaRequired).toBe(true);
      expect(res.body.data.mfaTempToken).toBeDefined();

      // Verify the temp token is valid and has the correct purpose
      const decoded = jwt.verify(
        res.body.data.mfaTempToken,
        mockJwtSecret + '-mfa-temp'
      ) as any;
      expect(decoded.purpose).toBe('mfa_temp');
      expect(decoded.userId).toBe('user-mfa-1');
    });

    it('should successfully verify TOTP and issue tokens on correct code', async () => {
      // Generate a real secret and token for verification
      const generated = speakeasy.generateSecret();
      const base32Secret = generated.base32;
      const validToken = speakeasy.totp({
        secret: base32Secret,
        encoding: 'base32',
      });

      const mfaUser = {
        id: 'user-mfa-2',
        email: 'mfa2@example.com',
        mfaEnabled: true,
        mfaSecret: encrypt(base32Secret),
        mfaBackupCodes: [],
        failedLoginAttempts: 0,
        lockedUntil: null,
      };

      mockUserFindById.mockResolvedValue(mfaUser);

      const tempToken = jwt.sign(
        { userId: mfaUser.id, purpose: 'mfa_temp' },
        env.jwtSecret + '-mfa-temp',
        { expiresIn: '5m' }
      );

      const res = await request(app)
        .post('/api/v1/security/mfa/verify-login')
        .send({ mfaTempToken: tempToken, code: validToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject invalid TOTP code', async () => {
      const generated = speakeasy.generateSecret();
      const base32Secret = generated.base32;

      const mfaUser = {
        id: 'user-mfa-3',
        email: 'mfa3@example.com',
        mfaEnabled: true,
        mfaSecret: encrypt(base32Secret),
        mfaBackupCodes: [],
        failedLoginAttempts: 0,
        lockedUntil: null,
      };

      mockUserFindById.mockResolvedValue(mfaUser);

      const tempToken = jwt.sign(
        { userId: mfaUser.id, purpose: 'mfa_temp' },
        env.jwtSecret + '-mfa-temp',
        { expiresIn: '5m' }
      );

      const res = await request(app)
        .post('/api/v1/security/mfa/verify-login')
        .send({ mfaTempToken: tempToken, code: '000000' });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid MFA code');
    });

    it('should reject expired/invalid mfaTempToken', async () => {
      const res = await request(app)
        .post('/api/v1/security/mfa/verify-login')
        .send({ mfaTempToken: 'totally.invalid.token', code: '123456' });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid or expired temporary MFA token');
    });
  });

  // ─── 4. Session Management ─────────────────────────────────────────────

  describe('4. Session & Device Management', () => {
    function makeToken(userId = 'user-session-1') {
      return jwt.sign(
        { id: userId, role: 'USER', email: 'sessions@test.com', businessId: 'biz-1' },
        env.jwtSecret
      );
    }

    it('should list active sessions', async () => {
      const token = makeToken();
      mockRefreshTokenFindMany.mockResolvedValue([
        {
          id: 'session-1',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
          lastUsedAt: new Date(),
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      ]);

      const res = await request(app)
        .get('/api/v1/security/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].browser).toBe('Chrome');
      expect(res.body.data[0].os).toBe('Windows');
    });

    it('should revoke a specific session', async () => {
      const token = makeToken();
      mockRefreshTokenFindFirst.mockResolvedValue({ id: 'session-to-revoke', userId: 'user-session-1' });
      mockRefreshTokenUpdate.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/security/sessions/session-to-revoke/revoke')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Session revoked');
    });
  });

  // ─── 5. Login Activity ─────────────────────────────────────────────────

  describe('5. Login Activity Logs', () => {
    it('should retrieve paginated login activity for authenticated user', async () => {
      const token = jwt.sign(
        { id: 'user-activity-1', role: 'USER', email: 'activity@test.com' },
        env.jwtSecret
      );

      mockLoginActivityFindMany.mockResolvedValue([
        { id: 'la-1', email: 'activity@test.com', status: 'SUCCESS', createdAt: new Date() },
      ]);
      mockLoginActivityCount.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/v1/security/login-activity?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(1);
    });
  });

  // ─── 6. IP Rule CIDR Gate (Middleware) ──────────────────────────────────

  describe('6. IP Filtering Middleware', () => {
    function makeOwnerToken() {
      return jwt.sign(
        { id: 'usr-owner', role: 'USER', email: 'owner@test.com', businessId: 'biz-ip-test' },
        env.jwtSecret
      );
    }

    it('should let requests pass when no IP rules are configured', async () => {
      const token = makeOwnerToken();
      mockUserBusinessRoleFindUnique.mockResolvedValue({ role: 'OWNER' });

      // First call: security-gate middleware queries active rules
      // Second call: the actual listIpRules controller call
      mockBusinessIpRuleFindMany
        .mockResolvedValueOnce([]) // middleware: no active rules
        .mockResolvedValueOnce([]); // controller: list all rules

      const res = await request(app)
        .get('/api/v1/security/ip-rules')
        .set('Authorization', `Bearer ${token}`)
        .set('x-business-id', 'biz-ip-test');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
