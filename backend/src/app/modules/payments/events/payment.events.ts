export interface PaymentCompletedPayload {
  paymentId: string;
  orderId: string;
  businessId: string;
  amount: number;
  currency: string;
  method: string;
  transactionId?: string;
  customerId?: string; // Optional: If we want to assign loyalty points
}

export interface PaymentFailedPayload {
  paymentId: string;
  orderId: string;
  businessId: string;
  amount: number;
  reason?: string;
  transactionId?: string;
}
