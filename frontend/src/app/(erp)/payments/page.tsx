'use client';

import React from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Plus, Eye, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentsPage() {
  return (
    <React.Fragment>
      <PageShell
        title="Payments Ledger"
        description="Verify incoming transaction logs, MFS settlements, and ledger reconciliations."
        actions={
          <Button disabled className="gap-2 cursor-not-allowed opacity-50 font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            Record Payment Voucher
          </Button>
        }
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-800">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="grid gap-1">
              <h5 className="font-extrabold text-base leading-none tracking-tight">Payments Ledger Blocked</h5>
              <div className="text-sm font-semibold opacity-90 leading-relaxed">
                This module is currently set to <span className="font-bold underline uppercase">Blocked Pending Backend</span>. The backend database lacks query capabilities for listing logged payments (`GET /payments`).
              </div>
            </div>
          </div>

          <Card className="border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
            <CardHeader className="bg-amber-500/5 pb-4 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                Integration Status: BLOCKED_PENDING_BACKEND
              </CardTitle>
              <CardDescription>
                Awaiting development of the backend ledger querying APIs. Creating fake client-side derived ledgers from other modules has been prohibited to ensure strict data consistency.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase text-slate-400">Required Backend Specifications</span>
                <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-900/30 space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-mono text-slate-700">GET /payments</span>
                    <span className="rounded bg-rose-100 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] text-rose-700 font-bold">MISSING</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-mono text-slate-700">Query Schema</span>
                    <span className="text-slate-500 text-[11px] font-normal">?limit=100&offset=0&businessId=...</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-700">DTO Response Contract</span>
                    <span className="text-slate-500 text-[11px] font-normal">PaymentContract[] (VoucherNo, Amount, Customer, Status, InvoiceRef)</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl border">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span>Review specifications in requirements document</span>
                </div>
                <Link
                  href="file:///C:/Users/Muzahid/.gemini/antigravity/brain/c48c4976-37a9-4bbf-b6dc-a0c9e4d42045/payments_backend_requirements.md"
                  target="_blank"
                  className="flex items-center gap-1 text-primary hover:underline font-bold"
                >
                  View Requirements
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Loading Skeleton Ledger simulation */}
          <div className="space-y-3 opacity-40">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-16 bg-slate-150 dark:bg-slate-850 rounded-lg animate-pulse" />
            <div className="h-16 bg-slate-150 dark:bg-slate-850 rounded-lg animate-pulse" />
            <div className="h-16 bg-slate-150 dark:bg-slate-850 rounded-lg animate-pulse" />
          </div>
        </div>
      </PageShell>
    </React.Fragment>
  );
}
