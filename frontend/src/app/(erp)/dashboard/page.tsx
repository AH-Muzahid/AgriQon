'use client';

import React from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, RefreshCw, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <React.Fragment>
      <PageShell
        title="Executive Dashboard"
        description="Real-time analytics and management controller for AgriQon ERP."
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-800">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="grid gap-1">
              <h5 className="font-extrabold text-base leading-none tracking-tight">Dashboard Summary API Pending</h5>
              <div className="text-sm font-semibold opacity-90 leading-relaxed">
                This screen is configured as <span className="font-bold underline uppercase">Blocked Pending Backend</span>. The backend does not provide unified KPI analytics or summary endpoints (`GET /dashboard/summary` or `GET /analytics`). All hardcoded mock data has been removed.
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm md:col-span-2">
              <CardHeader className="border-b bg-muted/10 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                  Integration Status: AWAITING_BACKEND
                </CardTitle>
                <CardDescription>
                  Displaying loading skeleton state. Hardcoded statistics and mock revenue charts have been eliminated to ensure true data integrity.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <span className="text-xs font-black uppercase text-slate-400">Missing Backend Endpoints</span>
                  <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-900/30 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-mono text-slate-700">GET /dashboard/summary</span>
                      <span className="rounded bg-rose-100 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] text-rose-700 font-bold">MISSING</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-mono text-slate-700">GET /analytics</span>
                      <span className="rounded bg-rose-100 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] text-rose-700 font-bold">MISSING</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl border text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span>Review analytics specifications in requirements document</span>
                  </div>
                  <Link
                    href="file:///C:/Users/Muzahid/.gemini/antigravity/brain/c48c4976-37a9-4bbf-b6dc-a0c9e4d42045/dashboard_requirements_report.md"
                    target="_blank"
                    className="flex items-center gap-1 text-primary hover:underline font-bold"
                  >
                    View Requirements
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200/80 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
              <CardHeader className="border-b bg-muted/10 pb-4">
                <CardTitle className="text-base font-bold text-slate-800">Alerts & Notifications</CardTitle>
                <CardDescription>System threshold safety logs</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 py-6 flex flex-col justify-center items-center text-center space-y-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase text-slate-400">Low Stock Log Pending</p>
                  <p className="text-[11px] text-muted-foreground font-semibold max-w-[200px]">
                    Waiting for safety threshold query support in inventory APIs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Skeleton HUD Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 opacity-40">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24 animate-pulse" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="h-6 bg-slate-250 dark:bg-slate-850 rounded w-16 animate-pulse" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-32 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="h-[280px] bg-slate-200/30 dark:bg-slate-900/10 rounded-xl border border-slate-200/50 p-6 flex flex-col justify-between opacity-30">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-250 rounded w-48 animate-pulse" />
              <div className="h-4 bg-slate-250 rounded w-24 animate-pulse" />
            </div>
            <div className="h-32 bg-slate-200 rounded animate-pulse" />
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-2 bg-slate-200 rounded w-8 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </PageShell>
    </React.Fragment>
  );
}
