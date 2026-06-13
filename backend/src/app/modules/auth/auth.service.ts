import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import axios from "axios";
import { env } from "../../../config/env";
import { AppError } from "../../errors/AppError";
import { UserRepository } from "./user.repository";
import { CreateUserDTO, LoginDTO } from "./auth.validation";
import { prisma } from "../../lib/prisma";
import speakeasy from "speakeasy";
import { decrypt } from "../../shared/utils/encryption";
import { AccountingService } from "../accounting/accounting.service";
import { AccountingRepository } from "../accounting/accounting.repository";
import { WarehouseService } from "../warehouse/warehouse.service";
import { WarehouseRepository } from "../warehouse/warehouse.repository";
import { SubscriptionService } from "../subscriptions/subscription.service";
import { SubscriptionRepository } from "../subscriptions/subscription.repository";

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async register(
    data: CreateUserDTO,
    sessionInfo?: { ip?: string; ua?: string },
  ) {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.$transaction(async (tx: any) => {
      // 1. Create User (using tx-bound repository)
      const createdUser = await this.userRepo.withTransaction(tx).create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });

      // 2. Create Organization
      const organization = await tx.organization.create({
        data: {
          name: `${data.name}'s Organization`,
        },
      });

      // 3. Create Business (Tenant)
      const business = await tx.business.create({
        data: {
          organizationId: organization.id,
          name: `${data.name}'s Business`,
        },
      });

      // 4. Link User as OWNER in UserBusinessRole
      await tx.userBusinessRole.create({
        data: {
          userId: createdUser.id,
          businessId: business.id,
          role: "OWNER",
        },
      });

      // 5. Update user's businessId link
      const updatedUser = await tx.user.update({
        where: { id: createdUser.id },
        data: { businessId: business.id },
      });

      // 6. Initialize Accounting Accounts
      const accountingRepoTx = new AccountingRepository(tx);
      const accountingServiceTx = new AccountingService(accountingRepoTx);
      await accountingServiceTx.initializeSystemAccounts(business.id);

      // 7. Create Default Warehouse
      const warehouseRepoTx = new WarehouseRepository(tx);
      const warehouseServiceTx = new WarehouseService(warehouseRepoTx);
      await warehouseServiceTx.createWarehouse({
        name: env.defaultWarehouseName || "Main Warehouse",
        businessId: business.id,
      } as any);

      // 8. Auto Provision Trial Subscription
      const subscriptionRepoTx = new SubscriptionRepository(tx);
      const subscriptionServiceTx = new SubscriptionService(subscriptionRepoTx);
      await subscriptionServiceTx.createTrialSubscription({ businessId: business.id }, tx);

      return updatedUser;
    });

    const accessToken = this.generateAccessToken(user);
    const { token: refreshToken, hashedToken } = this.generateSecureToken();
    const familyId = crypto.randomBytes(20).toString("hex");

    await this.saveRefreshToken(user.id, hashedToken, familyId, sessionInfo);

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginDTO, sessionInfo?: { ip?: string; ua?: string }) {
    const user = await this.userRepo.findByEmail(data.email);
    
    // Check if account is locked
    if (user && user.lockedUntil && user.lockedUntil > new Date()) {
      await prisma.loginActivity.create({
        data: {
          userId: user.id,
          email: data.email,
          status: "LOCKED",
          ipAddress: sessionInfo?.ip,
          userAgent: sessionInfo?.ua,
        },
      });
      throw new AppError("Account is temporarily locked. Please try again in 15 minutes.", 401);
    }

    if (!user || !user.password) {
      if (user) {
        const failedAttempts = user.failedLoginAttempts + 1;
        const dataUpdate: any = { failedLoginAttempts: failedAttempts };
        if (failedAttempts >= 5) {
          dataUpdate.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await prisma.user.update({ where: { id: user.id }, data: dataUpdate });

        await prisma.loginActivity.create({
          data: {
            userId: user.id,
            email: data.email,
            status: failedAttempts >= 5 ? "LOCKED" : "FAILED_PASSWORD",
            ipAddress: sessionInfo?.ip,
            userAgent: sessionInfo?.ua,
          },
        });
      } else {
        await prisma.loginActivity.create({
          data: {
            email: data.email,
            status: "FAILED_PASSWORD",
            ipAddress: sessionInfo?.ip,
            userAgent: sessionInfo?.ua,
          },
        });
      }
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch) {
      const failedAttempts = user.failedLoginAttempts + 1;
      const dataUpdate: any = { failedLoginAttempts: failedAttempts };
      if (failedAttempts >= 5) {
        dataUpdate.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await prisma.user.update({ where: { id: user.id }, data: dataUpdate });

      await prisma.loginActivity.create({
        data: {
          userId: user.id,
          email: data.email,
          status: failedAttempts >= 5 ? "LOCKED" : "FAILED_PASSWORD",
          ipAddress: sessionInfo?.ip,
          userAgent: sessionInfo?.ua,
        },
      });
      throw new AppError("Invalid email or password", 401);
    }

    // Password matches, check MFA status
    if (user.mfaEnabled) {
      if (!env.jwtSecret) {
        throw new AppError("JWT secret not configured", 500);
      }
      const mfaTempToken = jwt.sign(
        { userId: user.id, purpose: "mfa_temp" },
        env.jwtSecret + "-mfa-temp",
        { expiresIn: "5m" }
      );
      return { mfaRequired: true, mfaTempToken };
    }

    // No MFA: reset lockouts, log success, issue regular tokens
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await prisma.loginActivity.create({
      data: {
        userId: user.id,
        email: data.email,
        status: "SUCCESS",
        ipAddress: sessionInfo?.ip,
        userAgent: sessionInfo?.ua,
      },
    });

    const accessToken = this.generateAccessToken(user);
    const { token, hashedToken } = this.generateSecureToken();
    const familyId = crypto.randomBytes(20).toString("hex");

    await this.saveRefreshToken(user.id, hashedToken, familyId, sessionInfo);

    return { user, accessToken, refreshToken: token };
  }

  async verifyMFALogin(
    data: { mfaTempToken: string; code: string },
    sessionInfo?: { ip?: string; ua?: string }
  ) {
    let decoded: any;
    try {
      if (!env.jwtSecret) {
        throw new AppError("JWT secret not configured", 500);
      }
      decoded = jwt.verify(data.mfaTempToken, env.jwtSecret + "-mfa-temp");
    } catch (err) {
      throw new AppError("Invalid or expired temporary MFA token", 401);
    }

    if (decoded.purpose !== 'mfa_temp') {
      throw new AppError("Invalid or expired temporary MFA token", 401);
    }

    const userId = decoded.userId;
    const user = await this.userRepo.findById(userId);
    if (!user || !user.mfaSecret || !user.mfaEnabled) {
      throw new AppError("MFA is not set up or enabled for this user", 401);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError("Account is locked", 401);
    }

    const decryptedSecret = decrypt(user.mfaSecret);
    const isTotpValid = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: data.code,
      window: 1,
    });
    let isBackupCodeValid = false;
    let updatedBackupCodes = [...user.mfaBackupCodes];

    if (!isTotpValid) {
      for (let i = 0; i < user.mfaBackupCodes.length; i++) {
        const match = await bcrypt.compare(data.code, user.mfaBackupCodes[i]);
        if (match) {
          isBackupCodeValid = true;
          updatedBackupCodes.splice(i, 1);
          break;
        }
      }
    }

    if (!isTotpValid && !isBackupCodeValid) {
      await prisma.loginActivity.create({
        data: {
          userId: user.id,
          email: user.email,
          status: 'FAILED_MFA',
          ipAddress: sessionInfo?.ip,
          userAgent: sessionInfo?.ua,
        },
      });

      const failedAttempts = user.failedLoginAttempts + 1;
      const dataUpdate: any = { failedLoginAttempts: failedAttempts };
      if (failedAttempts >= 5) {
        dataUpdate.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({ where: { id: user.id }, data: dataUpdate });
        
        await prisma.loginActivity.create({
          data: {
            userId: user.id,
            email: user.email,
            status: 'LOCKED',
            ipAddress: sessionInfo?.ip,
            userAgent: sessionInfo?.ua,
          },
        });

        throw new AppError("Too many failed attempts. Account has been locked for 15 minutes.", 401);
      }

      await prisma.user.update({ where: { id: user.id }, data: dataUpdate });
      throw new AppError("Invalid MFA code", 401);
    }

    // Success: reset attempts, log activity
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        mfaBackupCodes: updatedBackupCodes,
      },
    });

    await prisma.loginActivity.create({
      data: {
        userId: user.id,
        email: user.email,
        status: 'SUCCESS',
        ipAddress: sessionInfo?.ip,
        userAgent: sessionInfo?.ua,
      },
    });

    const accessToken = this.generateAccessToken(user);
    const { token, hashedToken } = this.generateSecureToken();
    const familyId = crypto.randomBytes(20).toString("hex");

    await this.saveRefreshToken(user.id, hashedToken, familyId, sessionInfo);

    return { user, accessToken, refreshToken: token };
  }

  async listSessions(userId: string) {
    const activeTokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { lastUsedAt: 'desc' }
    });

    return activeTokens.map((token: any) => {
      const parsedUA = this.parseUserAgent(token.userAgent);
      return {
        id: token.id,
        ipAddress: token.ipAddress,
        userAgent: token.userAgent,
        browser: parsedUA.browser,
        os: parsedUA.os,
        device: parsedUA.device,
        lastUsedAt: token.lastUsedAt,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt
      };
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await prisma.refreshToken.findFirst({
      where: { id: sessionId, userId }
    });
    if (!session) {
      throw new AppError("Session not found", 404);
    }
    await prisma.refreshToken.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    });
  }

  async revokeAllOtherSessions(userId: string, currentSessionToken: string) {
    const hashedToken = this.hashToken(currentSessionToken);
    const currentSession = await prisma.refreshToken.findUnique({
      where: { token: hashedToken }
    });
    
    await prisma.refreshToken.updateMany({
      where: {
        userId,
        id: currentSession ? { not: currentSession.id } : undefined,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  private parseUserAgent(uaString: string | null): { device: string; os: string; browser: string } {
    if (!uaString) {
      return { device: 'Unknown', os: 'Unknown', browser: 'Unknown' };
    }
    
    let device = 'Desktop';
    if (/mobile/i.test(uaString)) device = 'Mobile';
    else if (/tablet/i.test(uaString)) device = 'Tablet';
    else if (/ipad/i.test(uaString)) device = 'Tablet';

    let os = 'Unknown';
    if (/windows/i.test(uaString)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(uaString)) os = 'macOS';
    else if (/android/i.test(uaString)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(uaString)) os = 'iOS';
    else if (/linux/i.test(uaString)) os = 'Linux';

    let browser = 'Unknown';
    if (/chrome|crios/i.test(uaString) && !/edge|opr\//i.test(uaString)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(uaString)) browser = 'Firefox';
    else if (/safari/i.test(uaString) && !/chrome|crios|edge|opr\//i.test(uaString)) browser = 'Safari';
    else if (/edge|edg/i.test(uaString)) browser = 'Edge';
    else if (/opera|opr/i.test(uaString)) browser = 'Opera';

    return { device, os, browser };
  }


  async refreshToken(
    token: string,
    sessionInfo?: { ip?: string; ua?: string },
  ) {
    const hashedToken = this.hashToken(token);
    const storedToken = await this.userRepo.findRefreshToken(hashedToken);

    if (!storedToken) {
      throw new AppError("Invalid refresh token", 401);
    }

    // Reuse Detection
    if (storedToken.revokedAt) {
      // If someone tries to use a revoked token, it's likely a replay attack.
      // Revoke the ENTIRE family for safety.
      if (storedToken.familyId) {
        await this.userRepo.revokeTokenFamily(storedToken.familyId);
      } else {
        await this.userRepo.revokeAllRefreshTokensForUser(storedToken.userId);
      }
      throw new AppError(
        "Token reuse detected! Security breach suspected. Session family revoked.",
        401,
      );
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 401);
    }

    // Generate new pair
    const accessToken = this.generateAccessToken(storedToken.user);
    const { token: newRawToken, hashedToken: newHashedToken } =
      this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Rotation: Revoke old token and link to new one
    await this.userRepo.revokeRefreshToken(storedToken.id, newHashedToken);

    // Save new token in the SAME family
    await this.userRepo.createRefreshToken({
      userId: storedToken.userId,
      token: newHashedToken,
      familyId: storedToken.familyId || undefined,
      expiresAt,
      ipAddress: sessionInfo?.ip,
      userAgent: sessionInfo?.ua,
    });

    return { accessToken, refreshToken: newRawToken };
  }

  async logout(token: string) {
    const hashedToken = this.hashToken(token);
    const storedToken = await this.userRepo.findRefreshToken(hashedToken);
    if (storedToken) {
      await this.userRepo.revokeRefreshToken(storedToken.id);
    }
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private generateSecureToken() {
    const token = crypto.randomBytes(40).toString("hex");
    const hashedToken = this.hashToken(token);
    return { token, hashedToken };
  }

  private async saveRefreshToken(
    userId: string,
    hashedToken: string,
    familyId?: string,
    sessionInfo?: { ip?: string; ua?: string },
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.userRepo.createRefreshToken({
      userId,
      token: hashedToken,
      familyId,
      expiresAt,
      ipAddress: sessionInfo?.ip,
      userAgent: sessionInfo?.ua,
    });
  }

  async oauthCallback(
    data: {
      email: string;
      name: string;
      provider: string;
      role?: "USER";
      idToken?: string;
    },
    sessionInfo?: { ip?: string; ua?: string },
  ) {
    // Validate incoming idToken (issued by Supabase) when present.
    // This prevents attackers from spoofing email/identity in the callback payload.
    if (!data.idToken) {
      throw new AppError("Missing idToken from OAuth provider", 400);
    }

    const verifiedEmail = await this.verifySupabaseToken(data.idToken);

    if (verifiedEmail && verifiedEmail !== data.email) {
      throw new AppError(
        "OAuth token email does not match provided email",
        401,
      );
    }

    // Validate client-provided `role`. Only USER is permitted at OAuth registration.
    const assignedRole: "USER" = "USER";

    let user = await this.userRepo.findByEmail(data.email);

    if (!user) {
      // Create new user if they don't exist — with validated role and auto-provisioned organization/business
      user = await prisma.$transaction(async (tx: any) => {
        const createdUser = await this.userRepo.withTransaction(tx).create({
          email: data.email,
          name: data.name,
          role: assignedRole,
        });

        const organization = await tx.organization.create({
          data: {
            name: `${data.name}'s Organization`,
          },
        });

        const business = await tx.business.create({
          data: {
            organizationId: organization.id,
            name: `${data.name}'s Business`,
          },
        });

        await tx.userBusinessRole.create({
          data: {
            userId: createdUser.id,
            businessId: business.id,
            role: "OWNER",
          },
        });

        const updatedUser = await tx.user.update({
          where: { id: createdUser.id },
          data: { businessId: business.id },
        });

        // Initialize Accounting Accounts
        const accountingRepoTx = new AccountingRepository(tx);
        const accountingServiceTx = new AccountingService(accountingRepoTx);
        await accountingServiceTx.initializeSystemAccounts(business.id);

        // Create Default Warehouse
        const warehouseRepoTx = new WarehouseRepository(tx);
        const warehouseServiceTx = new WarehouseService(warehouseRepoTx);
        await warehouseServiceTx.createWarehouse({
          name: env.defaultWarehouseName || "Main Warehouse",
          businessId: business.id,
        } as any);

        // Auto Provision Trial Subscription
        const subscriptionRepoTx = new SubscriptionRepository(tx);
        const subscriptionServiceTx = new SubscriptionService(subscriptionRepoTx);
        await subscriptionServiceTx.createTrialSubscription({ businessId: business.id }, tx);

        return updatedUser;
      });
    }

    const accessToken = this.generateAccessToken(user!);
    const { token, hashedToken } = this.generateSecureToken();
    const familyId = crypto.randomBytes(20).toString("hex");

    await this.saveRefreshToken(user!.id, hashedToken, familyId, sessionInfo);

    return { user: user!, accessToken, refreshToken: token };
  }

  private async verifySupabaseToken(idToken: string): Promise<string> {
    const decoded = jwt.decode(idToken, { complete: true }) as any;
    
    if (decoded && decoded.header) {
      const { alg, kid } = decoded.header;
      console.log(`[AuthService] Verifying Supabase token. Alg: ${alg}, Kid: ${kid}`);

      if (alg === "ES256") {
        try {
          // Fetch JWKS keys from Supabase project
          const jwksUrl = `${env.supabaseUrl}/auth/v1/.well-known/jwks.json`;
          console.log(`[AuthService] Fetching JWKS keys from ${jwksUrl}...`);
          const response = await axios.get(jwksUrl);
          const jwks = response.data;
          const jwk = jwks?.keys?.find((k: any) => k.kid === kid);
          if (!jwk) {
            throw new Error(`No matching key found in JWKS for kid: ${kid}`);
          }

          const publicKey = crypto.createPublicKey({
            format: "jwk",
            key: jwk,
          });

          const verified = jwt.verify(idToken, publicKey, {
            algorithms: ["ES256"],
          }) as any;

          const email = verified?.email || verified?.user?.email;
          if (!email) {
            throw new Error("Token payload does not contain email");
          }
          console.log("[AuthService] Token verified successfully via JWKS ES256");
          return email;
        } catch (err: any) {
          console.warn(`[AuthService] ES256 verification failed: ${err.message}. Falling back...`);
        }
      }
    } else {
      console.log("[AuthService] Token is not a valid JWT or could not be decoded. Skipping ES256 check.");
    }

    // HS256 fallback (legacy or local dev)
    try {
      const verified = jwt.verify(idToken, env.supabaseJwtSecret, {
        algorithms: ["HS256"],
      }) as any;
      const email = verified?.email || verified?.user?.email;
      if (!email) {
        throw new Error("Token payload does not contain email");
      }
      console.log("[AuthService] Token verified successfully via HS256 local secret");
      return email;
    } catch (jwtErr: any) {
      // Fallback: use Supabase Admin API to validate the token.
      console.warn(
        `[AuthService] HS256 JWT verify failed (${jwtErr?.message}), falling back to Supabase Admin API`,
      );
      try {
        const { createClient } = await import("@supabase/supabase-js");
        if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
          throw new Error("Supabase client is not fully configured (missing URL or Service Role Key)");
        }
        const supabaseAdmin = createClient(
          env.supabaseUrl,
          env.supabaseServiceRoleKey
        );
        const { data: userData, error: supaErr } =
          await supabaseAdmin.auth.getUser(idToken);
        if (supaErr || !userData?.user?.email) {
          throw new AppError(
            `OAuth token validation failed: ${supaErr?.message ?? "no user returned"}`,
            401,
          );
        }
        console.log("[AuthService] Token verified successfully via Supabase Admin API fallback");
        return userData.user.email;
      } catch (fallbackErr: any) {
        console.error("[AuthService] Supabase Admin fallback verification failed:", fallbackErr);
        if (fallbackErr instanceof AppError) throw fallbackErr;
        throw new AppError(
          `Invalid OAuth token: ${jwtErr?.message ?? "verification failed"}`,
          401,
        );
      }
    }
  }

  private generateAccessToken(user: any) {
    if (!env.jwtSecret) {
      throw new AppError("JWT secret not configured", 500);
    }
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        businessId: user.businessId,
        organizationId: user.organizationId,
      },
      env.jwtSecret,
      { expiresIn: env.jwtAccessExpiresIn as any },
    );
  }
}
