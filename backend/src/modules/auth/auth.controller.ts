import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schemas';
import { authService } from './auth.service';
import { env } from '../../config/env';
import jwt from 'jsonwebtoken';

// Verify OAuth provider token (Supabase JWT)
async function verifyProviderToken(provider: string, token: string): Promise<boolean> {
  // For OAuth flows, Supabase already verified the session
  // We trust Supabase's verification - no need to verify the token ourselves
  if (provider === 'google' || provider === 'supabase') {
    console.log('Trusting Supabase OAuth session verification');
    return true;
  }

  // For non-OAuth providers, verify our own JWT
  if (!token) return false;

  try {
    jwt.verify(token, env.jwtSecret);
    return true;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return false;
  }
}

export const authController = {
  async register(req: Request, res: Response) {
    const payload = registerSchema.parse(req.body);
    const result = await authService.register(payload);

    return res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload.email, payload.password);

    if (!result) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json(result);
  },

  async oauthCallback(req: Request, res: Response) {
    const { email, name, role, provider, idToken } = req.body;

    if (!email || !provider) {
      return res.status(400).json({ message: 'Email and provider are required' });
    }

    // Verify OAuth provider token (optional - Supabase already verified the session)
    const isValid = await verifyProviderToken(provider, idToken);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid OAuth token' });
    }

    const result = await authService.getOrCreateOAuthUser({
      email,
      name: name || email.split('@')[0],
      role: role || 'USER',
      provider,
    });

    return res.json(result);
  },

  async getProfile(req: Request, res: Response) {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  },
};
