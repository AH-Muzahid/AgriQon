import { z } from 'zod';

export const inviteUserSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
    role: z.enum(['OWNER', 'MANAGER', 'STAFF'] as const).default('STAFF'),
  }),
});
