import { z } from 'zod';
import { AccountType } from '../../../generated/client';

export const createAccountSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(1).max(20),
  type: z.nativeEnum(AccountType),
  description: z.string().optional(),
});

export const createJournalEntrySchema = z.object({
  description: z.string().min(1),
  reference: z.string().optional(),
  source: z.string().optional(),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debit: z.coerce.number().nonnegative().default(0),
    credit: z.coerce.number().nonnegative().default(0),
    description: z.string().optional(),
  })).min(2),
}).refine(data => {
  const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.001;
}, {
  message: "Journal entry must be balanced (total debits must equal total credits)",
});

export const ledgerQuerySchema = z.object({
  accountId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type LedgerQueryInput = z.infer<typeof ledgerQuerySchema>;
