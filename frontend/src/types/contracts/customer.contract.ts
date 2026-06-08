export interface CustomerTimelineEvent {
  date: string;
  event: string;
  type: string;
}

export interface CustomerContract {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  purchasesCount: number;
  totalSpent: number;
  dueAmount: number;
  status: 'ACTIVE' | 'INACTIVE';
  timeline: CustomerTimelineEvent[];
}

export interface CreateCustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
