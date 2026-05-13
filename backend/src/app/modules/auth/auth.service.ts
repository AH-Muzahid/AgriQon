import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../../config/env';
import { AppError } from '../../errors/AppError';
import { UserRepository } from './user.repository';
import { CreateUserDTO, LoginDTO } from './auth.validation';

export class AuthService {
  constructor(private userRepo: UserRepository) {}

  async register(data: CreateUserDTO) {
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
    const refreshToken = await this.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async login(data: LoginDTO) {
    const user = await this.userRepo.findByEmail(data.email);
    if (!user || !user.password) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordMatch = await bcrypt.compare(data.password, user.password);
    if (!isPasswordMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    const storedToken = await this.userRepo.findRefreshToken(token);

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Reuse Detection
    if (storedToken.revokedAt) {
      await this.userRepo.revokeAllRefreshTokensForUser(storedToken.userId);
      throw new AppError('Token reuse detected! All sessions revoked for security.', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      throw new AppError('Refresh token expired', 401);
    }

    // Rotation
    await this.userRepo.revokeRefreshToken(storedToken.id);
    
    const accessToken = this.generateAccessToken(storedToken.user);
    const newRefreshToken = await this.generateRefreshToken(storedToken.userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(token: string) {
    const storedToken = await this.userRepo.findRefreshToken(token);
    if (storedToken) {
      await this.userRepo.revokeRefreshToken(storedToken.id);
    }
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
      { expiresIn: env.jwtAccessExpiresIn }
    );
  }

  private async generateRefreshToken(userId: string) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.userRepo.createRefreshToken({
      userId,
      token,
      expiresAt,
    });

    return token;
  }
}
