export interface PaymentContract {
  id: string;
  paymentNo: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  amount: number;
  method: 'Bank Transfer' | 'MFS (bKash/Nagad)' | 'Cash' | 'Credit Card';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

export interface CreatePaymentInput {
  invoiceNo: string;
  amount: number;
  method: 'Bank Transfer' | 'MFS (bKash/Nagad)' | 'Cash' | 'Credit Card';
}
