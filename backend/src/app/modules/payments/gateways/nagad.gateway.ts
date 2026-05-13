import { IPaymentGateway, GatewayInitiatePayload, GatewayInitiateResponse, PaymentVerificationResult, GatewayRefundPayload, GatewayRefundResponse } from './gateway.interface';

export class NagadGateway implements IPaymentGateway {
  async initiatePayment(payload: GatewayInitiatePayload): Promise<GatewayInitiateResponse> {
    // Boilerplate for Nagad Initiate Payment
    console.log('Initiating Nagad payment', payload);
    return {
      success: true,
      paymentUrl: 'https://sandbox.nagad.com/api/checkout/...', 
    };
  }

  async verifyPayment(data: any): Promise<PaymentVerificationResult> {
    // Boilerplate for Nagad Verify Payment
    console.log('Verifying Nagad payment', data);
    return {
      isVerified: true,
      transactionId: data.transactionId || 'mock_trx_id',
      amount: data.amount || 0,
      currency: 'BDT',
      status: 'SUCCESS',
    };
  }

  async processRefund(payload: GatewayRefundPayload): Promise<GatewayRefundResponse> {
    // Boilerplate for Nagad Refund
    console.log('Processing Nagad refund', payload);
    return {
      success: true,
      refundId: 'mock_refund_id',
      status: 'COMPLETED',
    };
  }
}
