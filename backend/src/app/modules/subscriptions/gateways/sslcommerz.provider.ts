import { PaymentGatewayProvider } from './payment-gateway.interface';

export class SSLCommerzProvider implements PaymentGatewayProvider {
  async createPaymentSession(data: {
    amount: number;
    currency: string;
    paymentId: string;
    customerName: string;
    customerEmail: string;
  }) {
    const gatewayReference = `SSLC_${data.paymentId}_${Math.floor(Math.random() * 100000)}`;
    const sandboxUrl = `http://localhost:3000/subscription/billing?gateway=sslcommerz&paymentId=${data.paymentId}&ref=${gatewayReference}`;

    return {
      success: true,
      paymentUrl: sandboxUrl,
      gatewayReference,
      gatewayRawResponse: { sandbox: true, note: 'Mock session created successfully' },
    };
  }

  async verifyPayment(gatewayReference: string, payload: any) {
    const isVerified = payload.status === 'VALID' || payload.status === 'SUCCESS' || payload.val_id !== undefined;
    
    return {
      isVerified,
      amount: payload.amount ? parseFloat(payload.amount) : 0,
      currency: payload.currency || 'BDT',
      transactionId: payload.tran_id || `TXN_SSLC_${Math.floor(Math.random() * 100000)}`,
      status: isVerified ? ('SUCCESS' as const) : ('FAILED' as const),
      gatewayRawResponse: payload,
    };
  }

  async processWebhook(payload: any, headers: any) {
    // Signature validation simulation
    const signature = headers['x-sslcommerz-signature'] || payload.verify_sign;
    const isVerified = signature !== 'invalid';

    return {
      isVerified,
      amount: payload.amount ? parseFloat(payload.amount) : 0,
      currency: payload.currency || 'BDT',
      transactionId: payload.tran_id || `TXN_SSLC_${Math.floor(Math.random() * 100000)}`,
      gatewayReference: payload.gateway_ref || `SSLC_${Math.floor(Math.random() * 100000)}`,
      status: isVerified ? ('SUCCESS' as const) : ('FAILED' as const),
      gatewayRawResponse: payload,
    };
  }
}
