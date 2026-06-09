import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Role name is required' }).min(1, 'Role name cannot be empty'),
    description: z.string().optional(),
    permissions: z.array(z.string()).default([]),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});
