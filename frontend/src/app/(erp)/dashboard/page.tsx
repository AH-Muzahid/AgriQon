'use client';

import React, { useEffect, useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardSummary, useFinancialTrend } from '@/services/query/hooks';
import { useSubscriptionStatus, useUsageLimits } from '@/hooks/use-subscription';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useDashboardSummary();
  const { data: trend, isLoading: trendLoading, refetch: refetchTrend } = useFinancialTrend();
  const { status, isTrial, daysRemaining, isReadOnly } = useSubscriptionStatus();
  const { data: usage } = useUsageLimits();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([refetchSummary(), refetchTrend()]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value).replace('BDT', '৳');
  };

  const chartData = trend?.monthlySummaries || [];

  if (summaryLoading || trendLoading || !mounted) {
    return (
      <PageShell
        title="Executive Dashboard"
        description="Real-time analytics and management controller for AgriQon ERP."
      >
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border border-neutral-200 dark:border-neutral-800 shadow-sm animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-3 bg-neutral-250 dark:bg-neutral-850 rounded w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-16" />
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="h-[350px] bg-neutral-100/50 dark:bg-neutral-900/30 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 animate-pulse" />
        </div>
      </PageShell>
    );
  }

  // Safe defaults
  const kpis = {
    revenue: Number(summary?.revenue || 0),
    ordersCount: Number(summary?.ordersCount || 0),
    customersCount: Number(summary?.customersCount || 0),
    inventoryValue: Number(summary?.inventoryValue || 0),
    lowStockAlerts: Number(summary?.lowStockAlerts || 0),
  };

  return (
    <PageShell
      title="Executive Dashboard"
      description="Real-time analytics and management controller for AgriQon ERP."
      actions={
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Stats
        </button>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Revenue */}
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Net Revenue</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-neutral-800 dark:text-neutral-100">
                {formatCurrency(kpis.revenue)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span>Accrued transaction history</span>
              </p>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Sales Orders</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-neutral-800 dark:text-neutral-100">
                {kpis.ordersCount}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-indigo-500" />
                <span>Full order logs stored</span>
              </p>
            </CardContent>
          </Card>

          {/* Customers */}
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Customers</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-neutral-800 dark:text-neutral-100">
                {kpis.customersCount}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-blue-500" />
                <span>Active tenant relations</span>
              </p>
            </CardContent>
          </Card>

          {/* Inventory Valuation */}
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Inventory Value</span>
              <div className="p-2 bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 rounded-lg">
                <Package className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-neutral-800 dark:text-neutral-100">
                {formatCurrency(kpis.inventoryValue)}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-violet-500" />
                <span>Aggregate warehouses valuation</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Sidebar */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recharts Financial Trend */}
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm lg:col-span-2 bg-white/70 dark:bg-neutral-950/35 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-bold">Financial Performance Trend</CardTitle>
              <CardDescription className="text-xs">Comparison between net monthly revenue and purchasing expenses</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] pt-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" className="dark:stroke-neutral-800" />
                    <XAxis
                      dataKey="month"
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `৳${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        fontSize: '11px',
                        borderRadius: '8px',
                      }}
                      labelClassName="font-bold text-neutral-800"
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      name="Revenue"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      name="Expense"
                      dataKey="expense"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorExpense)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-xs text-muted-foreground">
                  <TrendingUp className="h-8 w-8 text-neutral-300 mb-2" />
                  No financial history data available for this business.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar Area: System Alerts and Subscription */}
          <div className="flex flex-col gap-6">
            {/* Low Stock Alerts */}
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white/70 dark:bg-neutral-950/35 backdrop-blur-md flex flex-col">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">System Alerts</CardTitle>
                  {kpis.lowStockAlerts > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {kpis.lowStockAlerts} Warnings
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs">Safety threshold warnings in inventory items</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow py-4 flex flex-col justify-center">
                {kpis.lowStockAlerts > 0 ? (
                  <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl text-rose-900 dark:text-rose-200">
                    <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="grid gap-0.5">
                      <h5 className="font-bold text-xs">Low Stock Threshold Breached</h5>
                      <p className="text-[11px] font-medium leading-relaxed opacity-90">
                        There are currently {kpis.lowStockAlerts} items running below safety stock level. Check the inventory management tab.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                    <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">Inventory Levels Safe</h5>
                      <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[200px]">
                        No low stock alerts or safety breaches recorded.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Overview Card */}
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white/70 dark:bg-neutral-950/35 backdrop-blur-md">
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">Subscription</CardTitle>
                  <Link href="/subscription" className="text-xs text-primary hover:underline flex items-center gap-0.5">
                    Details <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <CardDescription className="text-xs">Your plan level and usage limits</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-center justify-between text-xs border-b pb-2">
                  <span className="text-muted-foreground font-medium">Plan Level</span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{isTrial ? 'Free Trial' : 'Professional'}</span>
                    {isReadOnly && <Badge variant="outline" className="text-[9px] px-1 py-0 border-amber-500/30 text-amber-500 bg-amber-500/5">Read-Only</Badge>}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">Users</span>
                      <span className="font-semibold text-foreground">
                        {usage?.users?.current ?? 0} / {usage?.users?.limit ?? '∞'}
                      </span>
                    </div>
                    <Progress
                      value={usage?.users?.limit ? Math.min(100, Math.round(((usage.users.current) / usage.users.limit) * 100)) : 0}
                      className="h-1.5 bg-muted"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground font-medium">Catalog Products</span>
                      <span className="font-semibold text-foreground">
                        {usage?.products?.current ?? 0} / {usage?.products?.limit ?? '∞'}
                      </span>
                    </div>
                    <Progress
                      value={usage?.products?.limit ? Math.min(100, Math.round(((usage.products.current) / usage.products.limit) * 100)) : 0}
                      className="h-1.5 bg-muted"
                    />
                  </div>
                </div>

                {isTrial && (
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-2 flex items-center gap-2 text-[10px] text-blue-600 dark:text-blue-400">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      <strong>{daysRemaining} days</strong> remaining in trial mode.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
