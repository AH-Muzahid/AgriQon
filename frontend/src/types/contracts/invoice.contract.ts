export interface InvoiceContract {
  id: string;
  invoiceNo: string;
  orderId: string;
  customerName: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';
}

export interface CreateInvoiceInput {
  orderId: string;
  dueDate: string;
}
