import type { Request, Response } from 'express';
import { loginSchema, registerSchema } from './auth.schemas';
import { authService } from './auth.service';

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
};
