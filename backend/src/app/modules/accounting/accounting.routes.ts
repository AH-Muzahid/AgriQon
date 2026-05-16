import { Router } from 'express';
import { AccountingController } from './accounting.controller';
import { FinancialReportingController } from './financial-reporting.controller';
import { extractAuth, authorize } from '../../middleware/rbac.middleware';
import validateRequest from '../../middleware/validateRequest';
import { createAccountSchema, createJournalEntrySchema } from './accounting.validation';
import { Role } from '../../../generated/client';

const router = Router();

// Reporting Routes
router.get(
  '/reports/trial-balance',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER),
  FinancialReportingController.getTrialBalance
);

router.get(
  '/reports/profit-loss',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER),
  FinancialReportingController.getProfitAndLoss
);

router.get(
  '/reports/balance-sheet',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER),
  FinancialReportingController.getBalanceSheet
);

router.post(
  '/accounts',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT),
  validateRequest(createAccountSchema),
  AccountingController.createAccount
);

router.get(
  '/accounts',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER),
  AccountingController.getAccounts
);

router.post(
  '/journal-entries',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT, Role.CASHIER),
  validateRequest(createJournalEntrySchema),
  AccountingController.createJournalEntry
);

router.get(
  '/ledger',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER),
  AccountingController.getLedger
);

router.get(
  '/reconciliation',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT),
  AccountingController.reconcileBalances
);

export const AccountingRoutes = router;
