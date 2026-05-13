export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const PAYMENT_GATEWAYS = {
  STRIPE: 'STRIPE',
  SSLCOMMERZ: 'SSLCOMMERZ',
  BKASH: 'BKASH',
  NAGAD: 'NAGAD',
  CASH: 'CASH',
} as const;

export const CURRENCIES = {
  BDT: 'BDT',
  USD: 'USD',
  AED: 'AED',
} as const;
