import { z } from 'zod';

export const configureLoyaltySchema = z.object({
  pointsPerUnit: z.coerce.number().positive(),
  isActive: z.boolean().default(true),
});

export const awardPointsSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.coerce.number().positive(),
});

export type ConfigureLoyaltyInput = z.infer<typeof configureLoyaltySchema>;
export type AwardPointsInput = z.infer<typeof awardPointsSchema>;
