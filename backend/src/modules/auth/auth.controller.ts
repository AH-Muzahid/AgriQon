import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schemas';
import { authService } from './auth.service';
import { env } from '../../config/env';
import jwt from 'jsonwebtoken';

async function verifyGoogleIdToken(idToken: string): Promise<any | false> {
  if (!idToken) return false;

  try {
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    if (!resp.ok) return false;
    const payload = await resp.json();

    // Basic checks
    const iss = payload.iss;
    const aud = payload.aud;
    const exp = Number(payload.exp) * 1000;

    if (!['accounts.google.com', 'https://accounts.google.com'].includes(iss)) return false;
    if (!env.googleClientId) return false;
    if (aud !== env.googleClientId) return false;
    if (Date.now() > exp) return false;

    return payload;
  } catch (err) {
    console.error('Google token verification failed', err);
    return false;
  }
}

// Verify OAuth provider token (Supabase JWT)
async function verifyProviderToken(provider: string, token: string): Promise<boolean> {
  if (provider === 'google') {
    const ok = await verifyGoogleIdToken(token);
    return !!ok;
  }

  if (provider === 'supabase') {
    if (!token || !env.supabaseJwtSecret) return false;
    try {
      jwt.verify(token, env.supabaseJwtSecret);
      return true;
    } catch (err) {
      console.error('Supabase JWT verification failed:', err);
      return false;
    }
  }

  // Fallback: verify using our own JWT secret
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
    const { email, name, provider, idToken } = req.body;

    if (!email || !provider) {
      return res.status(400).json({ message: 'Email and provider are required' });
    }

    // Verify provider token strictly
    const isValid = await verifyProviderToken(provider, idToken);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid OAuth token' });
    }

    // Ignore any client-provided role; derive server-side
    const result = await authService.getOrCreateOAuthUser({
      email,
      name: name || email.split('@')[0],
      provider,
    });

    // Issue httpOnly cookie with our signed token
    try {
      res.cookie('authToken', result.token, {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    } catch (err) {
      console.error('Failed to set auth cookie', err);
    }

    return res.json({ user: result.user });
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
