export interface IPaymentGateway {
  /**
   * Initializes a payment intent or checkout session with the gateway.
   * @param payload The generic payment initialization payload
   * @returns A gateway-specific response containing payment URL, intent ID, or client secret
   */
  initiatePayment(payload: GatewayInitiatePayload): Promise<GatewayInitiateResponse>;

  /**
   * Verifies a payment based on gateway response or webhook data.
   * @param data Verification data (e.g., transaction ID, signature)
   * @returns Standardized verification result
   */
  verifyPayment(data: any): Promise<PaymentVerificationResult>;

  /**
   * Processes a refund for a previously successful payment.
   * @param payload Refund payload
   * @returns Refund status
   */
  processRefund(payload: GatewayRefundPayload): Promise<GatewayRefundResponse>;
}

export interface GatewayInitiatePayload {
  amount: number;
  currency: string;
  orderId: string;
  customerDetails?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  metadata?: Record<string, any>;
}

export interface GatewayInitiateResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  clientSecret?: string;
  gatewayRawResponse?: any;
}

export interface PaymentVerificationResult {
  isVerified: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  gatewayRawResponse?: any;
}

export interface GatewayRefundPayload {
  transactionId: string;
  amount: number;
  reason?: string;
}

export interface GatewayRefundResponse {
  success: boolean;
  refundId?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  gatewayRawResponse?: any;
}
