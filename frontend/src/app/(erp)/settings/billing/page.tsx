'use client';

import React from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, History, Plus, Receipt, Zap, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function BillingSettingsPage() {
  const billingHistory = [
    { invoiceNo: 'INV-BL-8891', date: '2026-06-01', amount: 4500, status: 'PAID' },
    { invoiceNo: 'INV-BL-8890', date: '2026-05-01', amount: 4500, status: 'PAID' },
    { invoiceNo: 'INV-BL-8889', date: '2026-04-01', amount: 4500, status: 'PAID' },
  ];

  const handleUpgrade = () => {
    toast.success('Initiating subscription upgrade checkout...');
  };

  const handleAddCard = () => {
    toast.info('Payment gateway setup modal triggered');
  };

  return (
    <PageShell
      title="Billing & Invoices"
      description="Review subscription payments, manage payment methods, and download operational receipts."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Plan & Payment Method */}
        <div className="space-y-6 md:col-span-1">
          {/* Plan Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3 flex flex-row justify-between items-start">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Current Plan</CardTitle>
                <CardDescription className="text-xs">Growth Subscription</CardDescription>
              </div>
              <Badge className="bg-primary text-xs">Active</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold">৳4,500/mo</div>
              <p className="text-xs text-muted-foreground">
                Next renewal occurs on <span className="font-semibold text-slate-700">July 1, 2026</span>
              </p>
              <Button onClick={handleUpgrade} className="w-full text-xs font-semibold gap-1 cursor-pointer">
                Upgrade Plan
                <ArrowUpRight className="size-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-800">Payment Modes</CardTitle>
              <CardDescription className="text-xs">Manage stored credit cards.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border p-3 rounded-lg flex items-center justify-between text-xs border-slate-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-5 text-indigo-500" />
                  <div>
                    <span className="font-bold block text-slate-700">•••• •••• •••• 4432</span>
                    <span className="text-[10px] text-muted-foreground">Expires 12/28</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase bg-slate-50">
                  Primary
                </Badge>
              </div>

              <Button onClick={handleAddCard} variant="outline" className="w-full text-xs gap-1.5 cursor-pointer">
                <Plus className="size-4" />
                Add Stored Card
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Billing History */}
        <div className="md:col-span-2">
          <Card className="border shadow-sm h-full">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Billing History</CardTitle>
              <CardDescription className="text-xs">Statements generated for subscription billing.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b font-semibold text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Invoice No</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {billingHistory.map((bill) => (
                    <tr key={bill.invoiceNo} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-semibold text-slate-700">{bill.invoiceNo}</td>
                      <td className="p-4 text-muted-foreground">{bill.date}</td>
                      <td className="p-4 font-mono font-semibold">৳{bill.amount.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-100 text-[10px]">
                          {bill.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs font-semibold cursor-pointer text-primary"
                          onClick={() => toast.success(`Downloading PDF for ${bill.invoiceNo}...`)}
                        >
                          <Receipt className="size-3.5 mr-1" />
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
