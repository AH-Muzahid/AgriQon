import { PaymentService } from '../payment.service';
import { prisma } from '../../../lib/prisma';
import { runInTransaction } from '../../../../shared/transactions/transaction.helper';
import { PAYMENT_STATUS } from '../payment.constants';
import { DomainEvents } from '../../../../shared/events/domain-events';

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    refund: {
      create: jest.fn(),
    },
    outboxEvent: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../../../shared/transactions/transaction.helper', () => ({
  runInTransaction: jest.fn((callback) => callback(require('../../../lib/prisma').prisma)),
}));

describe('PaymentService.handleRefund', () => {
  const mockPayment = {
    id: 'pay_1',
    businessId: 'biz_1',
    orderId: 'order_1',
    amount: 100,
    status: PAYMENT_STATUS.COMPLETED,
    transactionId: 'txn_1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process refund and emit PaymentRefunded event', async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
    (prisma.refund.create as jest.Mock).mockResolvedValue({ id: 'ref_1', amount: 50 });

    const refundParams = {
      paymentId: 'pay_1',
      amount: 50,
      reason: 'Customer request',
    };

    const result = await PaymentService.handleRefund(refundParams);

    expect(prisma.payment.findUnique).toHaveBeenCalledWith({ where: { id: 'pay_1' } });
    expect(prisma.refund.create).toHaveBeenCalledWith({
      data: {
        businessId: mockPayment.businessId,
        paymentId: mockPayment.id,
        amount: 50,
        reason: 'Customer request',
        status: 'COMPLETED',
      },
    });

    expect(prisma.payment.update).toHaveBeenCalledWith({
      where: { id: 'pay_1' },
      data: { status: PAYMENT_STATUS.REFUNDED },
    });

    expect(prisma.outboxEvent.create).toHaveBeenCalledWith({
      data: {
        businessId: mockPayment.businessId,
        aggregateType: 'Payment',
        aggregateId: mockPayment.id,
        eventType: DomainEvents.PAYMENT_REFUNDED,
        payload: {
          paymentId: mockPayment.id,
          orderId: mockPayment.orderId,
          businessId: mockPayment.businessId,
          amount: 50,
          reason: 'Customer request',
          transactionId: mockPayment.transactionId,
        },
      },
    });

    expect(result).toEqual({ id: 'ref_1', amount: 50 });
  });

  it('should throw error if payment not found', async () => {
    (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(
      PaymentService.handleRefund({ paymentId: 'invalid', amount: 10 })
    ).rejects.toThrow('Payment not found');
  });
});
