import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../../config/env';
import { AppError } from '../../errors/AppError';
import { UserRepository } from './user.repository';
import { CreateUserDTO, LoginDTO } from './auth.validation';

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async register(data: CreateUserDTO, sessionInfo?: { ip?: string; ua?: string }) {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.userRepo.create({
      ...data,
      password: hashedPassword,
    });

    const accessToken = this.generateAccessToken(user);
    const { token: refreshToken, hashedToken } = this.generateSecureToken();
    const familyId = crypto.randomBytes(20).toString('hex');
    
    await this.saveRefreshToken(user.id, hashedToken, familyId, sessionInfo);

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginDTO, sessionInfo?: { ip?: string; ua?: string }) {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const { token, hashedToken } = this.generateSecureToken();
    const familyId = crypto.randomBytes(20).toString('hex');
    
    await this.saveRefreshToken(user.id, hashedToken, familyId, sessionInfo);

    return { user, accessToken, refreshToken: token };
  }

  async refreshToken(token: string, sessionInfo?: { ip?: string; ua?: string }) {
    const hashedToken = this.hashToken(token);
    const storedToken = await this.userRepo.findRefreshToken(hashedToken);

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
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
      throw new AppError('Token reuse detected! Security breach suspected. Session family revoked.', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AppError('Refresh token expired', 401);
    }

    // Generate new pair
    const accessToken = this.generateAccessToken(storedToken.user);
    const { token: newRawToken, hashedToken: newHashedToken } = this.generateSecureToken();
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
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateSecureToken() {
    const token = crypto.randomBytes(40).toString('hex');
    const hashedToken = this.hashToken(token);
    return { token, hashedToken };
  }

  private async saveRefreshToken(
    userId: string, 
    hashedToken: string, 
    familyId?: string, 
    sessionInfo?: { ip?: string; ua?: string }
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
    data: { email: string; name: string; provider: string; role?: 'USER' | 'SELLER' | 'ADMIN' | 'MANAGER'; idToken?: string },
    sessionInfo?: { ip?: string; ua?: string }
  ) {
    // Validate incoming idToken (issued by Supabase) when present.
    // This prevents attackers from spoofing email/identity in the callback payload.
    if (!data.idToken) {
      throw new AppError('Missing idToken from OAuth provider', 400);
    }

    try {
      const verified = jwt.verify(data.idToken, env.supabaseJwtSecret, { algorithms: ['HS256'] }) as any;
      // Extract email from verified token payload in a defensive manner
      const verifiedEmail = verified?.email || verified?.user?.email || undefined;
      if (verifiedEmail && verifiedEmail !== data.email) {
        throw new AppError('OAuth token email does not match provided email', 401);
      }
    } catch (err: any) {
      throw new AppError(`Invalid OAuth token: ${err?.message ?? 'verification failed'}`, 401);
    }

    // Do NOT trust client-provided `role`. Default to USER for OAuth signups.
    const assignedRole: 'USER' | 'SELLER' | 'ADMIN' | 'MANAGER' = 'USER';

    let user = await this.userRepo.findByEmail(data.email);

    if (!user) {
      // Create new user if they don't exist — always with server-assigned role
      user = await this.userRepo.create({
        email: data.email,
        name: data.name,
        role: assignedRole,
      });
    }

    const accessToken = this.generateAccessToken(user);
    const { token, hashedToken } = this.generateSecureToken();
    const familyId = crypto.randomBytes(20).toString('hex');
    
    await this.saveRefreshToken(user.id, hashedToken, familyId, sessionInfo);

    return { user, accessToken, refreshToken: token };
  }

  private generateAccessToken(user: any) {
    if (!env.jwtSecret) {
      throw new AppError('JWT secret not configured', 500);
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
      { expiresIn: env.jwtAccessExpiresIn as any }
    );
  }

}
