import { Router } from 'express';
import { AccountingController } from './accounting.controller';
import { extractAuth, authorize } from '../../middleware/rbac.middleware';
import validateRequest from '../../middleware/validateRequest';
import { createAccountSchema, recordTransactionSchema } from './accounting.validation';
import { Role } from '../../../generated/client';

const router = Router();

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
  '/transactions',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT, Role.CASHIER),
  validateRequest(recordTransactionSchema),
  AccountingController.recordTransaction
);

router.get(
  '/ledger',
  extractAuth,
  authorize(Role.ADMIN, Role.ACCOUNTANT, Role.MANAGER),
  AccountingController.getLedger
);

export const AccountingRoutes = router;
