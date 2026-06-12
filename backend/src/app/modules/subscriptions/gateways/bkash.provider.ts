import { PaymentGatewayProvider } from './payment-gateway.interface';

export class BKashProvider implements PaymentGatewayProvider {
  async createPaymentSession(data: {
    amount: number;
    currency: string;
    paymentId: string;
    customerName: string;
    customerEmail: string;
  }) {
    const gatewayReference = `BKASH_${data.paymentId}_${Math.floor(Math.random() * 100000)}`;
    const sandboxUrl = `http://localhost:3000/subscription/billing?gateway=bkash&paymentId=${data.paymentId}&ref=${gatewayReference}`;

    return {
      success: true,
      paymentUrl: sandboxUrl,
      gatewayReference,
      gatewayRawResponse: { sandbox: true, note: 'bKash session created successfully' },
    };
  }

  async verifyPayment(gatewayReference: string, payload: any) {
    const isVerified = payload.transactionStatus === 'Completed' || payload.status === 'SUCCESS';
    
    return {
      isVerified,
      amount: payload.amount ? parseFloat(payload.amount) : 0,
      currency: payload.currency || 'BDT',
      transactionId: payload.trxID || `TXN_BKASH_${Math.floor(Math.random() * 100000)}`,
      status: isVerified ? ('SUCCESS' as const) : ('FAILED' as const),
      gatewayRawResponse: payload,
    };
  }

  async processWebhook(payload: any, headers: any) {
    const signature = headers['x-bkash-signature'] || payload.signature;
    const isVerified = signature !== 'invalid';

    return {
      isVerified,
      amount: payload.amount ? parseFloat(payload.amount) : 0,
      currency: payload.currency || 'BDT',
      transactionId: payload.trxID || `TXN_BKASH_${Math.floor(Math.random() * 100000)}`,
      gatewayReference: payload.paymentID || `BKASH_${Math.floor(Math.random() * 100000)}`,
      status: isVerified ? ('SUCCESS' as const) : ('FAILED' as const),
      gatewayRawResponse: payload,
    };
  }
}
