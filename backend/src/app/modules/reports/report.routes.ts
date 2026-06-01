import express from 'express';
import { auth } from '../../middleware/auth.middleware';
import * as ReportController from './report.controller';

const router = express.Router();

router.get(
  '/inventory-valuation',
  auth('ADMIN', 'MANAGER', 'SELLER'),
  ReportController.getInventoryValuationReport
);

router.get(
  '/procurement',
  auth('ADMIN', 'MANAGER', 'SELLER'),
  ReportController.getProcurementReport
);

router.get(
  '/profit-loss',
  auth('ADMIN', 'MANAGER', 'SELLER'),
  ReportController.getProfitAndLossReport
);

router.get(
  '/balance-sheet',
  auth('ADMIN', 'MANAGER', 'SELLER'),
  ReportController.getBalanceSheetReport
);

router.get(
  '/trial-balance',
  auth('ADMIN', 'MANAGER', 'SELLER'),
  ReportController.getTrialBalanceReport
);

export const ReportRoutes = router;
