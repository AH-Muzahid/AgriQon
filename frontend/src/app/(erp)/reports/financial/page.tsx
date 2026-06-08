'use client';

import React from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, PiggyBank, ArrowDownUp, ShieldCheck, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function FinancialReportsPage() {
  const plSummary = [
    { lineItem: 'Total Revenue (Billing)', value: 156250, indent: false, color: 'text-slate-800' },
    { lineItem: 'Cost of Goods Sold (COGS)', value: 114860, indent: true, color: 'text-rose-600' },
    { lineItem: 'Gross Profit', value: 41390, indent: false, color: 'text-emerald-600 font-bold' },
    { lineItem: 'Operating Expenses', value: 12500, indent: true, color: 'text-rose-600' },
    { lineItem: 'Net Operating Income', value: 28890, indent: false, color: 'text-primary font-bold text-base' },
  ];

  const handleExportGL = () => {
    toast.success('General Ledger exported successfully!');
  };

  return (
    <PageShell
      title="Financial Statements & Ledger"
      description="Inspect general ledger summaries, balance sheets, profit & loss (P&L) statements."
      actions={
        <Button className="text-xs" onClick={handleExportGL}>
          <Download className="mr-2 h-4 w-4" />
          Export General Ledger
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Cash Collections</span>
            <PiggyBank className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">৳84,500.00</div>
            <p className="text-[10px] text-muted-foreground mt-1">Cleared transaction receipts</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Outstanding Dues</span>
            <Coins className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">৳121,750.00</div>
            <p className="text-[10px] text-muted-foreground mt-1">Receivables from active invoices</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Net Income Margin</span>
            <ArrowDownUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-[10px] text-muted-foreground mt-1">Proportion of net profits to billing</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Ledger Audit Verification</span>
            <ShieldCheck className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Balanced</div>
            <p className="text-[10px] text-muted-foreground mt-1">Ledgers synced with Postgres audit hooks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* P&L Statement Card */}
        <Card className="border shadow-sm max-w-2xl">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800 font-sans">Profit & Loss (P&L) Statement</CardTitle>
            <span className="text-xs text-muted-foreground">Accrual basis statement mapping revenue against operational costs.</span>
          </CardHeader>
          <CardContent className="py-4">
            <div className="border rounded-lg overflow-hidden border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Financial Line Item</th>
                    <th className="p-3 text-right">Value (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {plSummary.map((item, idx) => (
                    <tr key={idx} className={item.indent ? 'bg-slate-50/20' : 'bg-background'}>
                      <td className={`p-3 ${item.indent ? 'pl-8 text-muted-foreground' : 'font-medium text-slate-800'}`}>
                        {item.lineItem}
                      </td>
                      <td className={`p-3 text-right font-mono font-semibold ${item.color}`}>
                        {item.indent ? '-' : ''}৳{item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
