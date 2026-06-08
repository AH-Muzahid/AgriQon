import { PaymentService } from '../payment.service';
import { GatewayFactory } from '../gateways/gateway.factory';

// Mock dependencies
jest.mock('../gateways/gateway.factory', () => ({
  GatewayFactory: {
    getGateway: jest.fn(),
  },
}));

jest.mock('../../../../shared/transactions/transaction.helper', () => ({
  runInTransaction: jest.fn().mockResolvedValue({ success: true, message: 'Payment successfully processed and reconciled.' })
}));

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    webhookEvent: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue({ id: 'webhook-123', status: 'PENDING' }),
      update: jest.fn().mockResolvedValue({ id: 'webhook-123', status: 'PROCESSED' }),
    },
  },
}));

describe('Webhook Verification', () => {
  it('should process webhook when signature is verified and status is SUCCESS', async () => {
    const mockGateway = {
      verifyPayment: jest.fn().mockResolvedValue({
        isVerified: true,
        status: 'SUCCESS',
        transactionId: 'txn_123'
      })
    };
    (GatewayFactory.getGateway as jest.Mock).mockReturnValue(mockGateway);

    const payload = { body: {}, headers: {} };
    const result = await PaymentService.verifyAndHandleWebhook('STRIPE', payload);

    expect(result.success).toBe(true);
  });

  it('should fail when signature verification fails', async () => {
    const mockGateway = {
      verifyPayment: jest.fn().mockResolvedValue({
        isVerified: false,
        status: 'FAILED',
        transactionId: ''
      })
    };
    (GatewayFactory.getGateway as jest.Mock).mockReturnValue(mockGateway);

    const payload = { body: {}, headers: {} };
    await expect(PaymentService.verifyAndHandleWebhook('STRIPE', payload)).rejects.toThrow('Webhook signature verification failed');
  });
});
