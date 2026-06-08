'use client';

import React from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, Calendar, ShoppingBag, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function SalesReportsPage() {
  const categoriesSales = [
    { category: 'Fertilizers', amount: 112000, percentage: 71.6, count: 20 },
    { category: 'Seeds', amount: 34500, percentage: 22.1, count: 20 },
    { category: 'Equipment', amount: 9750, percentage: 6.3, count: 15 },
  ];

  const handleExport = (format: string) => {
    toast.success(`Exporting Sales report as ${format}...`);
  };

  return (
    <PageShell
      title="Sales & Revenue Analysis"
      description="Track retail order velocities, regional product demand spikes, and sales representative KPIs."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs" onClick={() => handleExport('CSV')}>
            Export CSV
          </Button>
          <Button className="text-xs" onClick={() => handleExport('PDF')}>
            Export PDF Report
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Gross Booked Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">৳156,250.00</div>
            <p className="text-[10px] text-muted-foreground mt-1">+12.4% vs last month</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Average Invoice Size</span>
            <ShoppingBag className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳52,083.33</div>
            <p className="text-[10px] text-muted-foreground mt-1">From 3 active contract accounts</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Invoiced Units</span>
            <Calendar className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58 Units</div>
            <p className="text-[10px] text-muted-foreground mt-1">NPK Fertilizer, Seeds, and Compost</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Conversion Margin</span>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28.4%</div>
            <p className="text-[10px] text-muted-foreground mt-1">Average catalog markup index</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Sales by Category Card */}
        <Card className="border shadow-sm md:col-span-2">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800 font-sans">Product Category Share</CardTitle>
            <span className="text-xs text-muted-foreground">Distribution of billing revenue across catalog types.</span>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            {categoriesSales.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cat.category} ({cat.count} items)</span>
                  <span className="font-mono text-slate-800">
                    ৳{cat.amount.toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : 'bg-violet-500'
                    }`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top sales rep card */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800 font-sans">Territory Leaderboard</CardTitle>
            <span className="text-xs text-muted-foreground">Sales accounts closed.</span>
          </CardHeader>
          <CardContent className="py-4 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-semibold block text-slate-700">Dhaka Central Hub</span>
                <span className="text-[10px] text-muted-foreground">Manager: Siddik Ali</span>
              </div>
              <span className="font-mono font-bold text-slate-800">৳112,000</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-semibold block text-slate-700">Bogura Cold Storage</span>
                <span className="text-[10px] text-muted-foreground">Manager: Salim Khan</span>
              </div>
              <span className="font-mono font-bold text-slate-800">৳34,500</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold block text-slate-700">Natore Sales Desk</span>
                <span className="text-[10px] text-muted-foreground">Agent: Fahim Ahmed</span>
              </div>
              <span className="font-mono font-bold text-slate-800">৳9,750</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
