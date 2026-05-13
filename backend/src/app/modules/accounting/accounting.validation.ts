import { z } from 'zod';
import { AccountType } from '../../../generated/client';

export const createAccountSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(1).max(20),
  type: z.nativeEnum(AccountType),
  description: z.string().optional(),
});

export const recordTransactionSchema = z.object({
  accountId: z.string().uuid(),
  debit: z.coerce.number().nonnegative().optional().default(0),
  credit: z.coerce.number().nonnegative().optional().default(0),
  description: z.string().min(1),
  reference: z.string().optional(),
}).refine(data => data.debit > 0 || data.credit > 0, {
  message: "Either debit or credit must be greater than 0",
});

export const ledgerQuerySchema = z.object({
  accountId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type RecordTransactionInput = z.infer<typeof recordTransactionSchema>;
export type LedgerQueryInput = z.infer<typeof ledgerQuerySchema>;
