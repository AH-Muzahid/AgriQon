import { Prisma, User } from '../../../generated/client';
import { prisma } from '../../lib/prisma';

export class UserRepository {
  private prisma: any;

  constructor(tx?: any) {
    this.prisma = tx || prisma;
  }

  withTransaction(tx: any): UserRepository {
    return new UserRepository(tx);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
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
    familyId?: string;
  }) {
    return await this.prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token: string) {
    return await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async updateRefreshTokenUsage(id: string) {
    return await this.prisma.refreshToken.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });
  }

  async revokeRefreshToken(id: string, replacedBy?: string) {
    return await this.prisma.refreshToken.update({
      where: { id },
      data: { 
        revokedAt: new Date(),
        replacedBy: replacedBy || undefined
      },
    });
  }

  async revokeTokenFamily(familyId: string) {
    return await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllRefreshTokensForUser(userId: string) {
    return await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
