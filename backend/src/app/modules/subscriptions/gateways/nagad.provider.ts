import { PaymentGatewayProvider } from './payment-gateway.interface';

export class NagadProvider implements PaymentGatewayProvider {
  async createPaymentSession(data: {
    amount: number;
    currency: string;
    paymentId: string;
    customerName: string;
    customerEmail: string;
  }) {
    const gatewayReference = `NAGAD_${data.paymentId}_${Math.floor(Math.random() * 100000)}`;
    const sandboxUrl = `http://localhost:3000/subscription/billing?gateway=nagad&paymentId=${data.paymentId}&ref=${gatewayReference}`;

    return {
      success: true,
      paymentUrl: sandboxUrl,
      gatewayReference,
      gatewayRawResponse: { sandbox: true, note: 'Nagad session created' },
    };
  }

  async verifyPayment(gatewayReference: string, payload: any) {
    const isVerified = payload.status === 'Success' || payload.status === 'SUCCESS';
    
    return {
      isVerified,
      amount: payload.amount ? parseFloat(payload.amount) : 0,
      currency: payload.currency || 'BDT',
      transactionId: payload.issuer_payment_ref || `TXN_NAGAD_${Math.floor(Math.random() * 100000)}`,
      status: isVerified ? ('SUCCESS' as const) : ('FAILED' as const),
      gatewayRawResponse: payload,
    };
  }

  async processWebhook(payload: any, headers: any) {
    const signature = headers['x-nagad-signature'] || payload.signature;
    const isVerified = signature !== 'invalid';

    return {
      isVerified,
      amount: payload.amount ? parseFloat(payload.amount) : 0,
      currency: payload.currency || 'BDT',
      transactionId: payload.issuer_payment_ref || `TXN_NAGAD_${Math.floor(Math.random() * 100000)}`,
      gatewayReference: payload.payment_ref_id || `NAGAD_${Math.floor(Math.random() * 100000)}`,
      status: isVerified ? ('SUCCESS' as const) : ('FAILED' as const),
      gatewayRawResponse: payload,
    };
  }
}
