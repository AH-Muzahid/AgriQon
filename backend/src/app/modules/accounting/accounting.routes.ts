import { Router } from 'express';
import { z } from 'zod';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { AccountingRepository } from './accounting.repository';
import { FeatureGuardService } from '../subscriptions/feature-guard.service';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
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

// Dependency Injection Wiring
const subscriptionRepository = new SubscriptionRepository();
const featureGuard = new FeatureGuardService(subscriptionRepository);
const accountingRepository = new AccountingRepository();
const accountingService = new AccountingService(accountingRepository, featureGuard);
const accountingController = new AccountingController(accountingService);

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
  validateRequest(z.object({ body: createAccountSchema })),
  accountingController.createAccount
);

router.get(
  '/accounts',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_VIEW, ACCOUNTING_MANAGE),
  accountingController.getAccounts
);

router.post(
  '/journal-entries',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_CREATE, ACCOUNTING_MANAGE),
  validateRequest(z.object({ body: createJournalEntrySchema })),
  accountingController.createJournalEntry
);

router.get(
  '/ledger',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(ACCOUNTING_VIEW, ACCOUNTING_MANAGE),
  accountingController.getLedger
);

router.get(
  '/reconciliation',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(RECONCILIATION_MANAGE, RECONCILIATION_VIEW),
  accountingController.reconcileBalances
);

export const AccountingRoutes = router;
