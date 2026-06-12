import { PaymentGateway } from '../../../../generated/client';
import { PaymentGatewayProvider } from './payment-gateway.interface';
import { SSLCommerzProvider } from './sslcommerz.provider';
import { BKashProvider } from './bkash.provider';
import { NagadProvider } from './nagad.provider';
import { AppError } from '../../../../app/errors/AppError';
import httpStatus from 'http-status';

export class GatewayFactory {
  static getProvider(gateway: PaymentGateway | string): PaymentGatewayProvider {
    const norm = typeof gateway === 'string' ? gateway.toUpperCase() : gateway;
    switch (norm) {
      case 'SSLCOMMERZ':
        return new SSLCommerzProvider();
      case 'BKASH':
        return new BKashProvider();
      case 'NAGAD':
        return new NagadProvider();
      default:
        throw new AppError(`Unsupported payment gateway: ${gateway}`, httpStatus.BAD_REQUEST);
    }
  }
}
