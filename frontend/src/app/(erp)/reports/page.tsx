'use client';

import React from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  TrendingUp,
  Warehouse,
  Coins,
  Users,
  Wallet,
  ArrowRight,
  BarChart3,
  FileSpreadsheet,
  Download,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const reportCards = [
    {
      title: 'Sales & Revenue Reports',
      description: 'Track retail order velocities, regional product demand spikes, and sales representative KPIs.',
      icon: TrendingUp,
      iconColor: 'text-emerald-500 bg-emerald-50 border-emerald-100',
      href: '/reports/sales',
      badge: 'Real-time',
      shortcuts: [
        { label: 'Weekly Sales Sheet', action: 'Weekly Sales' },
        { label: 'Product Margin Analysis', action: 'Product Margins' },
      ],
    },
    {
      title: 'Inventory & Sourcing',
      description: 'Monitor stock levels, warehouse turn rates, aging inventory, and valuation summaries.',
      icon: Warehouse,
      iconColor: 'text-blue-500 bg-blue-50 border-blue-100',
      href: '/reports/inventory',
      badge: 'Updates Hourly',
      shortcuts: [
        { label: 'Stock Valuation Summary', action: 'Stock Valuation' },
        { label: 'Reorder Point Alert Log', action: 'Reorder Point Log' },
      ],
    },
    {
      title: 'Financial & Ledger Statements',
      description: 'Inspect general ledger summaries, balance sheets, profit & loss (P&L) statements, and cash flow.',
      icon: Coins,
      iconColor: 'text-violet-500 bg-violet-50 border-violet-100',
      href: '/reports/financial',
      badge: 'Audit Ready',
      shortcuts: [
        { label: 'Generate P&L Statement', action: 'P&L Statement' },
        { label: 'Outstanding Receivables aging', action: 'Outstanding Receivables' },
      ],
    },
    {
      title: 'Customer Analytics',
      description: 'Understand customer retention, lifetime value distributions, and outstanding balance risks.',
      icon: Users,
      iconColor: 'text-amber-500 bg-amber-50 border-amber-100',
      href: '/customers',
      badge: 'Cohort Analysis',
      shortcuts: [
        { label: 'LTV Heatmap', action: 'LTV Heatmap' },
        { label: 'Aging Receivables by Client', action: 'Aging Receivables' },
      ],
    },
    {
      title: 'Expense & Operational Vouchers',
      description: 'Log and monitor warehouse operating costs, transport expenses, and overhead allocations.',
      icon: Wallet,
      iconColor: 'text-rose-500 bg-rose-50 border-rose-100',
      href: '/expenses',
      badge: 'Vouchers Active',
      shortcuts: [
        { label: 'Log Operational Expense', action: 'Log Expense' },
        { label: 'Quarterly Cost Summary', action: 'Quarterly Costs' },
      ],
    },
  ];

  const triggerExport = (reportName: string) => {
    toast.success(`Export job queued for: ${reportName}`);
  };

  return (
    <PageShell
      title="Analytical Reports Hub"
      description="Access visual dashboards, generate audit statements, and export operational CSV files."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs" onClick={() => triggerExport('Master Audit Package')}>
            <Download className="h-4 w-4" />
            Export Audit Package
          </Button>
        </div>
      }
    >
      {/* Visual Analytics Quick Grid */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="border shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gross Operating Profit</span>
              <CardTitle className="text-2xl font-bold text-slate-800">৳240,500.00</CardTitle>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 font-semibold text-xs">
              +14%
            </span>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <span>Targeting ৳300k this quarter</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '80.1%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Inventory Turnover Rate</span>
              <CardTitle className="text-2xl font-bold text-slate-800">4.2x</CardTitle>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-xs text-center">
              Optimal
            </span>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-blue-500" />
              <span>Average inventory holding: 24 days</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '68%' }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm bg-gradient-to-br from-slate-50 to-white">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Days Sales Outstanding (DSO)</span>
              <CardTitle className="text-2xl font-bold text-slate-800">18.5 Days</CardTitle>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600 font-semibold text-xs">
              -3.2d
            </span>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-500" />
              <span>Average time to clear customer invoices</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '85%' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <Card key={idx} className="border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg border ${card.iconColor}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-semibold bg-slate-100 text-slate-700">
                    {card.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-800">{card.title}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 space-y-4">
                {/* Shortcuts */}
                <div className="border-t pt-3 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider mb-2">Quick Actions</span>
                  <div className="grid gap-1.5">
                    {card.shortcuts.map((shortcut, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => triggerExport(shortcut.action)}
                        className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-slate-900 border border-dashed hover:border-slate-300 hover:bg-slate-50/50 p-2 rounded-md transition-all text-left"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileSpreadsheet className="h-3.5 w-3.5 text-slate-400" />
                          {shortcut.label}
                        </span>
                        <Download className="h-3 w-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Button */}
                <div className="pt-2">
                  <Link href={card.href} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 font-semibold group cursor-pointer">
                      Open Report Dashboard
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
