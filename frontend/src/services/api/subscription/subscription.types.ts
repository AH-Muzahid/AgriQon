export interface SubscriptionPlan {
  code: string;
  name: string;
}

export interface SubscriptionCurrent {
  plan: SubscriptionPlan;
  status: 'TRIAL' | 'ACTIVE' | 'GRACE_PERIOD' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  startsAt: string;
  expiresAt: string;
  graceEndsAt: string | null;
  daysRemaining: number;
}

export interface UsageLimitItem {
  current: number;
  limit: number;
  pending?: number;
}

export interface SubscriptionUsage {
  users: UsageLimitItem;
  products: UsageLimitItem;
  warehouses: UsageLimitItem;
}

export interface SubscriptionFeatures {
  [key: string]: boolean;
}

export interface SubscriptionInvoice {
  id: string;
  businessId: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number | string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'VOID';
  dueDate: string;
  paidAt: string | null;
  createdAt: string;
}

export interface SubscriptionPayment {
  id: string;
  businessId: string;
  invoiceId: string;
  amount: number | string;
  method: string;
  transactionReference: string | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  createdAt: string;
}

export interface SubscriptionChangeRequest {
  id: string;
  businessId: string;
  subscriptionId: string;
  type: 'UPGRADE' | 'RENEWAL';
  requestedPlanCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  processedAt: string | null;
}

export interface SubscriptionBillingOverview {
  invoices: SubscriptionInvoice[];
  payments: SubscriptionPayment[];
  changeRequests: SubscriptionChangeRequest[];
}
