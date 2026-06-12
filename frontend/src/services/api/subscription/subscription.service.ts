import { apiClient } from '../client';
import { SubscriptionCurrent, SubscriptionUsage, SubscriptionFeatures, SubscriptionBillingOverview, SubscriptionChangeRequest } from './subscription.types';

export const subscriptionService = {
  async getCurrent(): Promise<SubscriptionCurrent> {
    return await apiClient.get<SubscriptionCurrent>('/subscription/current');
  },

  async getUsage(): Promise<SubscriptionUsage> {
    return await apiClient.get<SubscriptionUsage>('/subscription/usage');
  },

  async getFeatures(): Promise<SubscriptionFeatures> {
    return await apiClient.get<SubscriptionFeatures>('/subscription/features');
  },

  async getBillingOverview(): Promise<SubscriptionBillingOverview> {
    return await apiClient.get<SubscriptionBillingOverview>('/subscription/billing');
  },

  async createUpgradeRequest(requestedPlanCode: string): Promise<SubscriptionChangeRequest> {
    return await apiClient.post<SubscriptionChangeRequest>('/subscription/upgrade-request', { requestedPlanCode });
  },

  async createRenewalRequest(requestedPlanCode: string): Promise<SubscriptionChangeRequest> {
    return await apiClient.post<SubscriptionChangeRequest>('/subscription/renewal-request', { requestedPlanCode });
  },
};

export default subscriptionService;
export type { SubscriptionPlan, SubscriptionCurrent, UsageLimitItem, SubscriptionUsage, SubscriptionFeatures, SubscriptionInvoice, SubscriptionPayment, SubscriptionChangeRequest, SubscriptionBillingOverview } from './subscription.types';
