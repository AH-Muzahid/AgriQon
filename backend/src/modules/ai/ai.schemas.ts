import { z } from 'zod';

export const aiSearchSchema = z.object({
  query: z.string().min(2).max(300),
  limit: z.coerce.number().int().positive().max(20).default(8),
});

export const aiChatSchema = z.object({
  question: z.string().min(2).max(1000),
});
