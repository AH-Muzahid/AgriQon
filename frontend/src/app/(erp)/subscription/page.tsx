'use client';

import React from 'react';
import { useSubscriptionStatus, useUsageLimits, useFeatures } from '@/hooks/use-subscription';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Lock,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Building2,
  Shield,
  Layers,
  ArrowRight,
  RefreshCw,
  Coins
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function SubscriptionPage() {
  const {
    status,
    isGracePeriod,
    isSuspended,
    isReadOnly,
    isTrial,
    daysRemaining,
    isTrialWarning,
    graceEndsAt,
    expiresAt,
    isLoading: isStatusLoading,
    error: statusError,
  } = useSubscriptionStatus();

  const { data: usage, isLoading: isUsageLoading } = useUsageLimits();
  const { data: features, isLoading: isFeaturesLoading } = useFeatures();

  const handleRefresh = () => {
    window.location.reload();
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'TRIAL':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Free Trial</Badge>;
      case 'ACTIVE':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Active</Badge>;
      case 'GRACE_PERIOD':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse">Grace Period</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Expired</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">{statusStr}</Badge>;
    }
  };

  if (isStatusLoading || isUsageLoading || isFeaturesLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-500/5 rounded-lg border border-red-500/10">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
          <h3 className="font-semibold text-red-500">Error Loading Subscription</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We encountered an error loading your subscription status. Please refresh or contact support.
          </p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Calculate usage percentages and thresholds
  const calculateUsageInfo = (current: number, limit: number) => {
    if (!limit) return { percent: 0, status: 'normal' as const };
    const percent = Math.min(100, Math.round((current / limit) * 100));
    let usageStatus: 'normal' | 'warning' | 'critical' | 'limit_reached' = 'normal';

    if (percent >= 100) {
      usageStatus = 'limit_reached';
    } else if (percent >= 95) {
      usageStatus = 'critical';
    } else if (percent >= 80) {
      usageStatus = 'warning';
    }

    return { percent, status: usageStatus };
  };

  const usersInfo = calculateUsageInfo(usage?.users?.current ?? 0, usage?.users?.limit ?? 0);
  const productsInfo = calculateUsageInfo(usage?.products?.current ?? 0, usage?.products?.limit ?? 0);
  const warehousesInfo = calculateUsageInfo(usage?.warehouses?.current ?? 0, usage?.warehouses?.limit ?? 0);

  const getProgressColorClass = (statusStr: string) => {
    switch (statusStr) {
      case 'limit_reached':
        return '[&>div]:bg-red-500';
      case 'critical':
        return '[&>div]:bg-red-400';
      case 'warning':
        return '[&>div]:bg-amber-500';
      default:
        return '[&>div]:bg-emerald-500';
    }
  };

  const getUsageBadge = (statusStr: string, current: number, limit: number) => {
    if (current >= limit && limit > 0) {
      return <Badge variant="destructive" className="ml-2">Limit Reached</Badge>;
    }
    if (statusStr === 'warning' || statusStr === 'critical') {
      return <Badge className="ml-2 bg-amber-500/10 text-amber-500 border-amber-500/20">Nearing Limit</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plan</h1>
          <p className="text-sm text-muted-foreground">
            Manage your plan, check usage quotas, and explore premium features.
          </p>
        </div>
        <div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Subscription Warnings Banners */}
      {isTrialWarning && (
        <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 text-blue-500 rounded-xl">
          <Clock className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">Free Trial Expiry Alert:</span> Your free trial ends in{' '}
            <span className="font-bold">{daysRemaining} days</span>. Upgrade your plan to prevent business interruption and keep creating products and warehouses.
          </div>
        </div>
      )}

      {isGracePeriod && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/15 text-amber-500 rounded-xl">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold">Business is in Grace Period (Read-Only Mode):</span> Your active subscription has expired. We have granted a grace period until{' '}
              <span className="font-bold">{graceEndsAt ? new Date(graceEndsAt).toLocaleDateString() : 'N/A'}</span>.
            </div>
            <p className="text-xs opacity-90">
              You can access and search all records, run reports, and make payments. Adding new users, products, or warehouses is disabled.
            </p>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/15 text-red-500 rounded-xl">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold">Subscription Suspended:</span> Your account is suspended. All record mutations and active operations are blocked.
            </div>
            <p className="text-xs opacity-90">
              Please contact the organization owner or customer support to restore access.
            </p>
          </div>
        </div>
      )}

      {/* Main Info Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Overview Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Details of your current active service level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs uppercase font-medium text-muted-foreground">Current Plan</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-foreground">
                    {isTrial ? 'Free Trial Plan' : 'Professional (PRO) Plan'}
                  </span>
                  {getStatusBadge(status)}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase font-medium text-muted-foreground">Status</span>
                <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {isReadOnly ? (
                    <span className="text-amber-500 flex items-center gap-1">
                      <Lock className="h-4 w-4" /> Read-Only Mode
                    </span>
                  ) : (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Full Access
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground font-medium block">Subscription Expiry</span>
                <span className="font-semibold mt-0.5 block text-foreground">
                  {expiresAt ? new Date(expiresAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-medium block">Remaining Period</span>
                <span className="font-semibold mt-0.5 block text-foreground">
                  {isTrial ? `${daysRemaining} days of trial left` : 'N/A'}
                </span>
              </div>
            </div>

            {isGracePeriod && (
              <div className="border-t pt-4 bg-muted/40 p-3 rounded-lg border text-sm space-y-1">
                <span className="font-medium text-amber-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" /> Grace Period Active
                </span>
                <p className="text-xs text-muted-foreground">
                  Grace period ends on: <strong>{graceEndsAt ? new Date(graceEndsAt).toLocaleDateString() : 'N/A'}</strong>. Please renew to resume full read-write capabilities.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Card / CTA */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary/0 to-primary/10 border-primary/20 flex flex-col justify-between">
          <CardHeader>
            <div className="p-2 bg-primary/10 rounded-lg w-fit text-primary mb-2">
              <Sparkles className="h-5 w-5" />
            </div>
            <CardTitle>Unlock Pro Features</CardTitle>
            <CardDescription>
              Expand your capabilities with higher quotas and premium tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow flex flex-col justify-end">
            <div className="text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Up to 20 user seats</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Up to 5,000 product SKUs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Up to 10 warehouse branches</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                <span>Accounting & AI Assistant</span>
              </div>
            </div>

            <Button asChild className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 shadow cursor-pointer">
              <a href="/subscription/billing">
                Manage Subscription & Billing <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Usage Quotas */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Quotas</CardTitle>
          <CardDescription>Monitor your usage against your plan limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Users */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted-foreground" /> Invited Users
                {getUsageBadge(usersInfo.status, usage?.users?.current ?? 0, usage?.users?.limit ?? 0)}
              </span>
              <span className="text-muted-foreground font-medium">
                {usage?.users?.current ?? 0} / {usage?.users?.limit ?? '∞'}
              </span>
            </div>
            <Progress
              value={usersInfo.percent}
              className={`h-2 bg-muted ${getProgressColorClass(usersInfo.status)}`}
            />
            <p className="text-xs text-muted-foreground">
              Required to invite members and assign roles.
            </p>
          </div>

          {/* Products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-muted-foreground" /> Catalog Products
                {getUsageBadge(productsInfo.status, usage?.products?.current ?? 0, usage?.products?.limit ?? 0)}
              </span>
              <span className="text-muted-foreground font-medium">
                {usage?.products?.current ?? 0} / {usage?.products?.limit ?? '∞'}
              </span>
            </div>
            <Progress
              value={productsInfo.percent}
              className={`h-2 bg-muted ${getProgressColorClass(productsInfo.status)}`}
            />
            <p className="text-xs text-muted-foreground">
              Total unique product SKUs in your marketplace catalog.
            </p>
          </div>

          {/* Warehouses */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-muted-foreground" /> Warehouses
                {getUsageBadge(warehousesInfo.status, usage?.warehouses?.current ?? 0, usage?.warehouses?.limit ?? 0)}
              </span>
              <span className="text-muted-foreground font-medium">
                {usage?.warehouses?.current ?? 0} / {usage?.warehouses?.limit ?? '∞'}
              </span>
            </div>
            <Progress
              value={warehousesInfo.percent}
              className={`h-2 bg-muted ${getProgressColorClass(warehousesInfo.status)}`}
            />
            <p className="text-xs text-muted-foreground">
              Physical or logical storage sites for stock management.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Feature Access Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access</CardTitle>
          <CardDescription>Included and locked modules under your current plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {features && Object.entries(features).map(([key, val]) => {
              const formatKey = (str: string) => {
                return str
                  .toLowerCase()
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase());
              };

              return (
                <div
                  key={key}
                  className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
                    val
                      ? 'bg-emerald-500/5 border-emerald-500/10 text-foreground'
                      : 'bg-muted/40 border-border text-muted-foreground'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold block">{formatKey(key)}</span>
                    <span className="text-xs block">
                      {val ? 'Included in Plan' : 'Professional Only'}
                    </span>
                  </div>
                  <div>
                    {val ? (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <div className="flex items-center gap-0.5">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">🔒</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
