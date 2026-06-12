import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/services/api/subscription/subscription.service';
import { SubscriptionCurrent, SubscriptionUsage, SubscriptionFeatures, SubscriptionBillingOverview } from '@/services/api/subscription/subscription.types';

export const subscriptionKeys = {
  all: ['subscription'] as const,
  current: () => [...subscriptionKeys.all, 'current'] as const,
  usage: () => [...subscriptionKeys.all, 'usage'] as const,
  features: () => [...subscriptionKeys.all, 'features'] as const,
  billing: () => [...subscriptionKeys.all, 'billing'] as const,
};

export function useSubscription() {
  return useQuery<SubscriptionCurrent>({
    queryKey: subscriptionKeys.current(),
    queryFn: () => subscriptionService.getCurrent(),
  });
}

export function useUsageLimits() {
  return useQuery<SubscriptionUsage>({
    queryKey: subscriptionKeys.usage(),
    queryFn: () => subscriptionService.getUsage(),
  });
}

export function useFeatures() {
  return useQuery<SubscriptionFeatures>({
    queryKey: subscriptionKeys.features(),
    queryFn: () => subscriptionService.getFeatures(),
  });
}

export function useSubscriptionBilling() {
  return useQuery<SubscriptionBillingOverview>({
    queryKey: subscriptionKeys.billing(),
    queryFn: () => subscriptionService.getBillingOverview(),
  });
}

export function useFeature(featureKey: string): boolean {
  const { data: features } = useFeatures();
  if (!features) return false;
  return !!features[featureKey];
}

export function useSubscriptionStatus() {
  const { data: sub, isLoading, error } = useSubscription();

  const status = sub?.status || 'ACTIVE';
  const isGracePeriod = status === 'GRACE_PERIOD';
  const isSuspended = status === 'SUSPENDED';
  const isExpired = status === 'EXPIRED';
  const isCancelled = status === 'CANCELLED';
  const isTrial = status === 'TRIAL';
  const daysRemaining = sub?.daysRemaining ?? 0;

  // Read-only mode applies to grace period, suspended, expired, or cancelled status
  const isReadOnly = isGracePeriod || isSuspended || isExpired || isCancelled;
  const isTrialWarning = isTrial && daysRemaining <= 5;

  return {
    status,
    isGracePeriod,
    isSuspended,
    isReadOnly,
    isTrial,
    daysRemaining,
    isTrialWarning,
    graceEndsAt: sub?.graceEndsAt || null,
    expiresAt: sub?.expiresAt || '',
    isLoading,
    error,
  };
}
