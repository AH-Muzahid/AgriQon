import { IPaymentGateway, GatewayInitiatePayload, GatewayInitiateResponse, PaymentVerificationResult, GatewayRefundPayload, GatewayRefundResponse } from './gateway.interface';

export class BkashGateway implements IPaymentGateway {
  async initiatePayment(payload: GatewayInitiatePayload): Promise<GatewayInitiateResponse> {
    // Boilerplate for bKash Initiate Payment
    console.log('Initiating bKash payment', payload);
    return {
      success: true,
      paymentUrl: 'https://sandbox.payment.bkash.com/checkout/...', 
    };
  }

  async verifyPayment(data: any): Promise<PaymentVerificationResult> {
    // Boilerplate for bKash Verify Payment
    console.log('Verifying bKash payment', data);
    return {
      isVerified: true,
      transactionId: data.transactionId || 'mock_trx_id',
      amount: data.amount || 0,
      currency: 'BDT',
      status: 'SUCCESS',
    };
  }

  async processRefund(payload: GatewayRefundPayload): Promise<GatewayRefundResponse> {
    // Boilerplate for bKash Refund
    console.log('Processing bKash refund', payload);
    return {
      success: true,
      refundId: 'mock_refund_id',
      status: 'COMPLETED',
    };
  }
}
