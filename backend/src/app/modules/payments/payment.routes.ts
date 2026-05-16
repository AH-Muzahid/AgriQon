import express from 'express';
import { PaymentController } from './payment.controller';

const router = express.Router();

// Route to initiate a new payment
router.post('/initiate', PaymentController.initiatePayment);

// Webhook for all payment gateways (e.g., /webhook/stripe, /webhook/sslcommerz)
router.post('/webhook/:gateway', PaymentController.handleWebhook);

// Route to process a refund
router.post('/refund', PaymentController.handleRefund);

export const PaymentRoutes = router;
