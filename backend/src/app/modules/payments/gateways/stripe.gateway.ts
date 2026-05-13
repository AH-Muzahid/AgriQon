import {
  GatewayInitiatePayload,
  GatewayInitiateResponse,
  GatewayRefundPayload,
  GatewayRefundResponse,
  IPaymentGateway,
  PaymentVerificationResult,
} from './gateway.interface';

// Note: Ensure you have 'stripe' installed in package.json
import Stripe from 'stripe';
import { env } from '../../../../config/env';

export class StripeGateway implements IPaymentGateway {
  private stripe: any;

  constructor() {
    // We should ideally fetch the secret from business settings
    // For now, we fallback to environment variables
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  async initiatePayment(
    payload: GatewayInitiatePayload
  ): Promise<GatewayInitiateResponse> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(payload.amount * 100), // Stripe expects cents
        currency: payload.currency.toLowerCase(),
        metadata: {
          orderId: payload.orderId,
          ...payload.metadata,
        },
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || undefined,
        gatewayRawResponse: paymentIntent,
      };
    } catch (error: any) {
      console.error('Stripe initiatePayment error:', error);
      return {
        success: false,
        gatewayRawResponse: error,
      };
    }
  }

  async verifyPayment(data: any): Promise<PaymentVerificationResult> {
    try {
      let intent: any;
      let isVerified = false;

      // Handle webhook with signature verification
      if (data.headers && data.headers['stripe-signature']) {
        const signature = data.headers['stripe-signature'];
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_mock';
        
        // Construct event (requires raw body)
        const rawBody = data.rawBody || JSON.stringify(data.body);
        const event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        
        isVerified = true;
        
        if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
          intent = event.data.object;
        } else {
          // Handle other event types if needed
          intent = event.data.object;
        }
      } else {
        // Fallback for manual verification using paymentIntentId
        const paymentIntentId = data.paymentIntentId || data.id || data.body?.transactionId;
        if (!paymentIntentId) {
          throw new Error('No transaction ID provided');
        }
        intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        isVerified = true;
      }

      let status: 'SUCCESS' | 'FAILED' | 'PENDING' = 'PENDING';

      if (intent.status === 'succeeded') {
        status = 'SUCCESS';
      } else if (intent.status === 'requires_payment_method' || intent.status === 'canceled') {
        status = 'FAILED';
      }

      return {
        isVerified,
        transactionId: intent.id,
        amount: intent.amount / 100,
        currency: intent.currency.toUpperCase(),
        status,
        gatewayRawResponse: intent,
      };
    } catch (error) {
      console.error('Stripe verifyPayment error:', error);
      return {
        isVerified: false,
        transactionId: data?.body?.transactionId || data?.paymentIntentId || '',
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
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: payload.transactionId,
        amount: Math.round(payload.amount * 100),
        reason: (payload.reason as any) || 'requested_by_customer',
      });

      return {
        success: refund.status === 'succeeded' || refund.status === 'pending',
        refundId: refund.id,
        status: refund.status === 'succeeded' ? 'COMPLETED' : refund.status === 'pending' ? 'PENDING' : 'FAILED',
        gatewayRawResponse: refund,
      };
    } catch (error) {
      console.error('Stripe processRefund error:', error);
      return {
        success: false,
        status: 'FAILED',
        gatewayRawResponse: error,
      };
    }
  }
}
