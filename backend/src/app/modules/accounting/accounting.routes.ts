import { Router } from 'express';
import { AccountingController } from './accounting.controller';
import { FinancialReportingController } from './financial-reporting.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import validateRequest from '../../middleware/validateRequest';
import { createAccountSchema, createJournalEntrySchema } from './accounting.validation';
import {
  ACCOUNTING_CREATE,
  ACCOUNTING_VIEW,
  ACCOUNTING_MANAGE,
  RECONCILIATION_MANAGE,
  RECONCILIATION_VIEW,
} from '../../constants/permissions';

const router = Router();

// Reporting Routes
router.get(
  '/reports/trial-balance',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_VIEW, ACCOUNTING_MANAGE),
  FinancialReportingController.getTrialBalance
);

router.get(
  '/reports/profit-loss',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_VIEW, ACCOUNTING_MANAGE),
  FinancialReportingController.getProfitAndLoss
);

router.get(
  '/reports/balance-sheet',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_VIEW, ACCOUNTING_MANAGE),
  FinancialReportingController.getBalanceSheet
);

router.post(
  '/accounts',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_CREATE, ACCOUNTING_MANAGE),
  validateRequest(createAccountSchema),
  AccountingController.createAccount
);

router.get(
  '/accounts',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_VIEW, ACCOUNTING_MANAGE),
  AccountingController.getAccounts
);

router.post(
  '/journal-entries',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_CREATE, ACCOUNTING_MANAGE),
  validateRequest(createJournalEntrySchema),
  AccountingController.createJournalEntry
);

router.get(
  '/ledger',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_VIEW, ACCOUNTING_MANAGE),
  AccountingController.getLedger
);

router.get(
  '/reconciliation',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(RECONCILIATION_MANAGE, RECONCILIATION_VIEW),
  AccountingController.reconcileBalances
);

export const AccountingRoutes = router;
