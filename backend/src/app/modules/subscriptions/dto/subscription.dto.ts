import { z } from 'zod';

export const createTrialSubscriptionSchema = z.object({
  businessId: z.string({
    required_error: 'Business ID is required',
  }),
});

export type CreateTrialSubscriptionDTO = z.infer<typeof createTrialSubscriptionSchema>;
