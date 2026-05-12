import { z } from 'zod';
import { Role } from '@prisma/client';

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
