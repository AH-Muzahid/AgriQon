import { Prisma, User } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  async createRefreshToken(data: { 
    userId: string; 
    token: string; 
    expiresAt: Date;
    userAgent?: string;
    ipAddress?: string;
    replacedBy?: string;
  }) {
    return await prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token: string) {
    return await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(id: string, replacedBy?: string) {
    return await prisma.refreshToken.update({
      where: { id },
      data: { 
        revokedAt: new Date(),
        replacedBy: replacedBy || undefined
      },
    });
  }

  async revokeAllRefreshTokensForUser(userId: string) {
    return await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
