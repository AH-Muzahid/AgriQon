import { IPaymentGateway, GatewayInitiatePayload, GatewayInitiateResponse, PaymentVerificationResult, GatewayRefundPayload, GatewayRefundResponse } from './gateway.interface';

export class BkashGateway implements IPaymentGateway {
  async initiatePayment(payload: GatewayInitiatePayload): Promise<GatewayInitiateResponse> {
    console.log('Initiating bKash payment', payload);
    return {
      success: true,
      transactionId: 'BKASH_' + Date.now() + '_' + payload.orderId,
      paymentUrl: 'https://sandbox.payment.bkash.com/checkout/...', 
    };
  }

  async verifyPayment(data: any): Promise<PaymentVerificationResult> {
    console.log('Verifying bKash payment', data);
    return {
      isVerified: true,
      transactionId: data.transactionId || data.body?.transactionId,
      amount: data.amount || data.body?.amount || 0,
      currency: 'BDT',
      status: 'SUCCESS',
    };
  }

  async processRefund(payload: GatewayRefundPayload): Promise<GatewayRefundResponse> {
    console.log('Processing bKash refund', payload);
    return {
      success: true,
      refundId: 'mock_refund_id',
      status: 'COMPLETED',
    };
  }
}
