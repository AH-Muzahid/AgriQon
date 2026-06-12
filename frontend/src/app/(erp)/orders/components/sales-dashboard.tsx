'use client';

import React from 'react';
import { Users, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useSalesDashboardMetrics } from '@/services/query/hooks';
import { KPIStatCard } from '@/components/business/KPIStatCard';

export function SalesDashboard() {
  const { data: metrics, isLoading } = useSalesDashboardMetrics();

  const formattedValue = (val: number) => {
    return `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-5 mb-6">
      <KPIStatCard
        title="Total Invoiced"
        value={isLoading ? '...' : formattedValue(metrics?.totalInvoiced)}
        description="Accumulated sales volume"
        icon={<FileText className="h-4 w-4 text-blue-500" />}
        isLoading={isLoading}
      />
      <KPIStatCard
        title="Total Collected"
        value={isLoading ? '...' : formattedValue(metrics?.totalCollected)}
        description="Cash received to date"
        icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        isLoading={isLoading}
      />
      <KPIStatCard
        title="Outstanding Receivables"
        value={isLoading ? '...' : formattedValue(metrics?.outstandingReceivables)}
        description="Total unpaid accounts"
        icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
        isLoading={isLoading}
      />
      <KPIStatCard
        title="Overdue Receivables"
        value={isLoading ? '...' : formattedValue(metrics?.overdueReceivables)}
        description="Past invoice due dates"
        icon={<ShieldCheck className="h-4 w-4 text-rose-500" />}
        isLoading={isLoading}
      />
      <KPIStatCard
        title="Client Accounts"
        value={isLoading ? '...' : metrics?.customerCount || 0}
        description="Active purchasing clients"
        icon={<Users className="h-4 w-4" />}
        isLoading={isLoading}
      />
    </div>
  );
}
export default SalesDashboard;
