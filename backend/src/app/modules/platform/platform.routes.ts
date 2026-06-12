import { Router } from 'express';
import { PlatformController } from './platform.controller';
import { extractAuth, requireAuth, requirePlatformAdmin } from '../../middleware/rbac.middleware';

const router = Router();

// Apply platform admin guards globally to this router
router.use(extractAuth, requireAuth, requirePlatformAdmin);

// Subscription Plans CRUD
router.get('/plans', PlatformController.getPlans);
router.get('/plans/:id', PlatformController.getPlanById);
router.post('/plans', PlatformController.createPlan);
router.patch('/plans/:id', PlatformController.updatePlan);
router.delete('/plans/:id', PlatformController.deletePlan);

// Operational Dashboard & Diagnostics
router.get('/health', PlatformController.getHealthStatus);
router.get('/queues', PlatformController.getQueuesStatus);
router.post('/impersonate', PlatformController.postImpersonateUser);
router.get('/audit-logs', PlatformController.getGlobalAuditLogsList);

export const PlatformRoutes = router;
