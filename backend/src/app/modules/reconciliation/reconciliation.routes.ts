import { Router } from 'express';
import { ReconciliationController } from './reconciliation.controller';
import { auth } from '../../middleware/auth.middleware';

const router = Router();
const controller = new ReconciliationController();

// Integrity checks
router.get('/history', auth(), (req, res) => controller.getHistory(req, res));
router.get('/global', auth('ADMIN'), (req, res) => controller.globalCheck(req, res));
router.get('/:businessId', auth('ADMIN', 'MANAGER'), (req, res) => controller.checkIntegrity(req, res));

// Remediation
router.post('/fix/inventory', auth('ADMIN'), (req, res) => controller.fixInventory(req, res));
router.post('/fix/account', auth('ADMIN'), (req, res) => controller.fixAccount(req, res));
router.post('/fix/outbox', auth('ADMIN'), (req, res) => controller.retryOutbox(req, res));

export const ReconciliationRoutes = router;
