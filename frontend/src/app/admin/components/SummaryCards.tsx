'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, CreditCard, Percent, Coins } from 'lucide-react';

interface SummaryCardsProps {
  summary: any;
  loading: boolean;
  formatBDT: (amount: number) => string;
}

export function SummaryCards({ summary, loading, formatBDT }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="border-slate-800 bg-slate-900/40">
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-[100px] mb-4" />
              <Skeleton className="h-8 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <Card className="border-slate-800 bg-slate-900/40 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-xl translate-x-5 -translate-y-5 group-hover:bg-indigo-500/10 transition-all duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold text-slate-400">Monthly Recurring (MRR)</CardTitle>
          <TrendingUp className="h-4 w-4 text-indigo-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-100">{formatBDT(summary?.revenue?.mrr || 0)}</div>
          <p className="text-xs text-indigo-400 font-semibold mt-1">Active subscriptions only</p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/40 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl translate-x-5 -translate-y-5 group-hover:bg-emerald-500/10 transition-all duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold text-slate-400">Annual Run Rate (ARR)</CardTitle>
          <CreditCard className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-100">{formatBDT(summary?.revenue?.arr || 0)}</div>
          <p className="text-xs text-emerald-400 font-semibold mt-1">MRR extrapolated × 12</p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/40 hover:border-amber-500/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full blur-xl translate-x-5 -translate-y-5 group-hover:bg-amber-500/10 transition-all duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold text-slate-400">Trial to Paid Conversion</CardTitle>
          <Percent className="h-4 w-4 text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-100">{summary?.conversion?.conversionRate || 0}%</div>
          <p className="text-xs text-amber-400 font-semibold mt-1">
            {summary?.conversion?.paidSubscriptions || 0} of {summary?.conversion?.totalSubscriptions || 0} active
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/40 hover:border-pink-500/30 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute top-0 right-0 h-24 w-24 bg-pink-500/5 rounded-full blur-xl translate-x-5 -translate-y-5 group-hover:bg-pink-500/10 transition-all duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-semibold text-slate-400">Total Cash Collected</CardTitle>
          <Coins className="h-4 w-4 text-pink-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-100">{formatBDT(summary?.revenue?.totalCollected || 0)}</div>
          <p className="text-xs text-pink-400 font-semibold mt-1">SaaS invoices paid</p>
        </CardContent>
      </Card>
    </div>
  );
}
