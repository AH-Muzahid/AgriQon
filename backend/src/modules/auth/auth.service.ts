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
};
