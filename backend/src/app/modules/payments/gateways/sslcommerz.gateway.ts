import {
  GatewayInitiatePayload,
  GatewayInitiateResponse,
  GatewayRefundPayload,
  GatewayRefundResponse,
  IPaymentGateway,
  PaymentVerificationResult,
} from './gateway.interface';
import axios from 'axios';

// A mock implementation for SSLCommerz since they don't have an official modern typed TS SDK
// Usually we use the REST API directly
export class SSLCommerzGateway implements IPaymentGateway {
  private storeId: string;
  private storePassword: string;
  private isSandbox: boolean;
  private baseUrl: string;

  constructor() {
    this.storeId = process.env.SSLC_STORE_ID || 'testbox';
    this.storePassword = process.env.SSLC_STORE_PASSWORD || 'testpass';
    this.isSandbox = process.env.NODE_ENV !== 'production';
    this.baseUrl = this.isSandbox
      ? 'https://sandbox.sslcommerz.com'
      : 'https://securepay.sslcommerz.com';
  }

  async initiatePayment(
    payload: GatewayInitiatePayload
  ): Promise<GatewayInitiateResponse> {
    try {
      const data = {
        store_id: this.storeId,
        store_passwd: this.storePassword,
        total_amount: payload.amount,
        currency: payload.currency,
        tran_id: `TXN_${Date.now()}_${payload.orderId}`,
        success_url: `${process.env.APP_URL}/api/v1/payments/webhook/sslcommerz/success`,
        fail_url: `${process.env.APP_URL}/api/v1/payments/webhook/sslcommerz/fail`,
        cancel_url: `${process.env.APP_URL}/api/v1/payments/webhook/sslcommerz/cancel`,
        cus_name: payload.customerDetails?.name || 'Customer Name',
        cus_email: payload.customerDetails?.email || 'customer@example.com',
        cus_phone: payload.customerDetails?.phone || '01700000000',
        shipping_method: 'NO',
        product_name: 'Order ' + payload.orderId,
        product_category: 'General',
        product_profile: 'general',
        value_a: payload.orderId, // Custom tracking
      };

      const response = await axios.post(`${this.baseUrl}/gwprocess/v3/api.php`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data && response.data.status === 'SUCCESS') {
        return {
          success: true,
          transactionId: data.tran_id,
          paymentUrl: response.data.GatewayPageURL,
          gatewayRawResponse: response.data,
        };
      }

      return {
        success: false,
        gatewayRawResponse: response.data,
      };
    } catch (error) {
      console.error('SSLCommerz initiatePayment error:', error);
      return {
        success: false,
        gatewayRawResponse: error,
      };
    }
  }

  async verifyPayment(data: any): Promise<PaymentVerificationResult> {
    try {
      // Validate IPN response
      const valId = data.val_id;
      
      const verificationUrl = `${this.baseUrl}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${this.storeId}&store_passwd=${this.storePassword}`;
      const response = await axios.get(verificationUrl);
      
      let status: 'SUCCESS' | 'FAILED' | 'PENDING' = 'PENDING';
      let isVerified = false;

      if (response.data && response.data.status === 'VALID' || response.data.status === 'VALIDATED') {
        status = 'SUCCESS';
        isVerified = true;
      } else {
        status = 'FAILED';
      }

      return {
        isVerified,
        transactionId: response.data.tran_id || data.tran_id,
        amount: parseFloat(response.data.amount),
        currency: response.data.currency,
        status,
        gatewayRawResponse: response.data,
      };
    } catch (error) {
      console.error('SSLCommerz verifyPayment error:', error);
      return {
        isVerified: false,
        transactionId: data.tran_id,
        amount: 0,
        currency: '',
        status: 'FAILED',
        gatewayRawResponse: error,
      };
    }
  }

  async processRefund(
    payload: GatewayRefundPayload
  ): Promise<GatewayRefundResponse> {
     // Implement REST API refund call if available
     // For now, return mock pending
    return {
      success: true,
      status: 'PENDING',
      refundId: 'REF_' + Date.now(),
      gatewayRawResponse: { message: 'Refund initiated via SSLC API stub' }
    };
  }
}
