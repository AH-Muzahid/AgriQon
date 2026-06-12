import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { extractAuth, attachBusinessRole, authorizeAny } from '../../middleware/rbac.middleware';
import { requireTenant } from '../../middleware/tenant.middleware';
import { REPORT_VIEW } from '../../constants/permissions';
import validateRequest from '../../middleware/validateRequest';
import { financialTrendQuerySchema } from './analytics.validation';

const router = Router();

router.get(
  '/summary',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  AnalyticsController.getDashboardSummary
);

router.get(
  '/financial-trend',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  validateRequest(financialTrendQuerySchema),
  AnalyticsController.getFinancialTrend
);

router.get(
  '/sales-dashboard',
  extractAuth,
  requireTenant,
  attachBusinessRole,
  authorizeAny(REPORT_VIEW),
  AnalyticsController.getSalesDashboard
);

export const AnalyticsRoutes = router;
