import { PaymentGateway } from '../../../../generated/client';

export interface PaymentGatewayProvider {
  /**
   * Initializes a payment session with the gateway.
   */
  createPaymentSession(data: {
    amount: number;
    currency: string;
    paymentId: string;
    customerName: string;
    customerEmail: string;
  }): Promise<{
    success: boolean;
    paymentUrl: string;
    gatewayReference: string;
    gatewayRawResponse?: any;
  }>;

  /**
   * Manually verifies a payment via GET callback or API query.
   */
  verifyPayment(gatewayReference: string, payload: any): Promise<{
    isVerified: boolean;
    amount: number;
    currency: string;
    transactionId: string;
    status: 'SUCCESS' | 'FAILED';
    gatewayRawResponse?: any;
  }>;

  /**
   * Processes a webhook callback from the gateway.
   */
  processWebhook(payload: any, headers: any): Promise<{
    isVerified: boolean;
    amount: number;
    currency: string;
    transactionId: string;
    gatewayReference: string;
    status: 'SUCCESS' | 'FAILED';
    gatewayRawResponse?: any;
  }>;
}
