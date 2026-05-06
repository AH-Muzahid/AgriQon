import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../../config/env';
import { prisma } from '../../lib/prisma';

async function getSupabaseAdminUserByEmail(email: string) {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null;

  try {
    const url = `${env.supabaseUrl.replace(/\/$/, '')}/auth/v1/admin/users?email=${encodeURIComponent(email)}`;
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: env.supabaseServiceRoleKey,
        Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
      },
    });

    if (!resp.ok) return null;

    const data = await resp.json();
    // The admin endpoint may return an array of users
    if (Array.isArray(data) && data.length > 0) return data[0];
    return null;
  } catch (err) {
    console.error('Failed to fetch Supabase admin user', err);
    return null;
  }
}

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type OAuthUserInput = {
  email: string;
  name: string;
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
      // Try to derive role from Supabase admin user metadata when available
      let derivedRole: Role = input.email.endsWith('@agroclients.com') ? 'SELLER' : 'USER';

      const supaUser = await getSupabaseAdminUserByEmail(input.email);
      if (supaUser) {
        const metaRole = supaUser.user_metadata?.role || supaUser.user_metadata?.roles || supaUser.app_metadata?.roles;
        if (typeof metaRole === 'string') {
          const r = metaRole.toUpperCase();
          if (r === 'SELLER' || r === 'ADMIN') derivedRole = r as Role;
        } else if (Array.isArray(metaRole) && metaRole.length > 0) {
          const r = String(metaRole[0]).toUpperCase();
          if (r === 'SELLER' || r === 'ADMIN') derivedRole = r as Role;
        }
      }

      user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: derivedRole,
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
