export interface OrderItemContract {
  sku: string;
  name: string;
  qty: number;
  price: number;
}

export interface OrderTimelineEvent {
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  desc: string;
}

export interface OrderContract {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  items: OrderItemContract[];
  timeline: OrderTimelineEvent[];
  invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
  };
}

export interface CreateOrderInput {
  customerId: string;
  items: { sku: string; qty: number }[];
}

export interface UpdateOrderStatusInput {
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';
  desc?: string;
}
