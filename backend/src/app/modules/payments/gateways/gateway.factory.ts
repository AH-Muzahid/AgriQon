import { IPaymentGateway } from './gateway.interface';
import { StripeGateway } from './stripe.gateway';
import { SSLCommerzGateway } from './sslcommerz.gateway';
import { BkashGateway } from './bkash.gateway';
import { NagadGateway } from './nagad.gateway';
import { PAYMENT_GATEWAYS } from '../payment.constants';
import { TPaymentGateway } from '../payment.types';

export class GatewayFactory {
  /**
   * Retrieves the appropriate payment gateway implementation based on the provider string.
   * @param provider The payment provider requested
   * @returns An instance of the corresponding IPaymentGateway
   * @throws Error if the provider is unsupported or not implemented yet
   */
  static getGateway(provider: TPaymentGateway | string): IPaymentGateway {
    switch (provider) {
      case PAYMENT_GATEWAYS.STRIPE:
        return new StripeGateway();
      case PAYMENT_GATEWAYS.SSLCOMMERZ:
        return new SSLCommerzGateway();
      case PAYMENT_GATEWAYS.BKASH:
        return new BkashGateway();
      case PAYMENT_GATEWAYS.NAGAD:
        return new NagadGateway();
      case PAYMENT_GATEWAYS.CASH:
        throw new Error('Cash payments do not require an online payment gateway');
      default:
        throw new Error(`Unsupported payment provider: ${provider}`);
    }
  }
}
