import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type OAuthUserInput = {
  email: string;
  name: string;
  role: 'USER' | 'SELLER';
  provider: string;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

const signToken = (id: string, role: Role) => jwt.sign({ id, role }, env.jwtSecret, { expiresIn: '7d' });

export const authService = {
  async register(input: RegisterInput) {
    const password = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { ...input, password },
      select: publicUserSelect,
    });

    return { user, token: signToken(user.id, user.role) };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return null;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      token: signToken(user.id, user.role),
    };
  },

  async getOrCreateOAuthUser(input: OAuthUserInput) {
    // Try to find existing user by email
    let user = await prisma.user.findUnique({
      where: { email: input.email },
      select: publicUserSelect,
    });

    // Create user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
          provider: input.provider,
        },
        select: publicUserSelect,
      });
    }

    return {
      user,
      token: signToken(user.id, user.role),
    };
  },

  async passwordResetOAuth(email: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
      select: publicUserSelect,
    });

    return { user: updatedUser };
  },

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  },
};
