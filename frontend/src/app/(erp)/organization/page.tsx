'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Landmark, Warehouse, Users, ShoppingBasket, DollarSign, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_AUDIT_LOGS, MOCK_SUBSCRIPTION_USAGE, MockAuditLog } from '@/lib/mock-erp-data';

export default function OrganizationPage() {
  const [logs] = useState<MockAuditLog[]>(MOCK_AUDIT_LOGS);
  const usage = MOCK_SUBSCRIPTION_USAGE;

  const handleUpgrade = () => {
    toast.success('Initiating subscription upgrade checkout...');
  };

  const auditColumns = [
    {
      header: 'User',
      accessor: (row: MockAuditLog) => (
        <span className="font-medium text-foreground">{row.user}</span>
      ),
    },
    {
      header: 'Action',
      accessor: (row: MockAuditLog) => (
        <span className="text-slate-700 font-semibold">{row.action}</span>
      ),
    },
    {
      header: 'Module',
      accessor: (row: MockAuditLog) => (
        <Badge variant="outline" className="text-[10px] font-semibold uppercase bg-slate-50/50">
          {row.module}
        </Badge>
      ),
    },
    {
      header: 'Timestamp',
      accessor: (row: MockAuditLog) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: 'IP Address',
      accessor: (row: MockAuditLog) => (
        <span className="font-mono text-xs text-muted-foreground">{row.ipAddress}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: MockAuditLog) => (
        <StatusBadge status={row.status === 'SUCCESS' ? 'ACTIVE' : 'FAILED'} />
      ),
    },
  ];

  return (
    <PageShell
      title="Organization Overview"
      description="Configure multi-tenant parameters, company details, subscription usage and system audit logs."
    >
      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Business Name</span>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">AgriQon Corporation</div>
            <p className="text-[10px] text-muted-foreground mt-1">Multi-tenant Main Instance</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Tax ID / BIN</span>
            <Landmark className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono font-bold">BIN-882-990-1</div>
            <p className="text-[10px] text-muted-foreground mt-1">Registered Tax Authority</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Active Warehouses</span>
            <Warehouse className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{usage.warehousesUsed} / {usage.warehousesLimit}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Regional distribution hubs</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Active Members</span>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{usage.usersUsed} / {usage.usersLimit}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Seat slots consumed</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">SKU Count</span>
            <ShoppingBasket className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{usage.productsUsed} / {usage.productsLimit}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Catalog items registered</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-emerald-600">৳240,500</div>
            <p className="text-[10px] text-muted-foreground mt-1">Accrued current billing</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Subscription Plans */}
        <Card className="border shadow-sm lg:col-span-2">
          <CardHeader className="border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">Subscription Summary</CardTitle>
                <CardDescription className="text-xs mt-0.5">Scale resources and invite more staff</CardDescription>
              </div>
              <Badge className="bg-primary hover:bg-primary text-xs flex gap-1 items-center px-2 py-0.5">
                <Zap className="h-3 w-3 fill-white" />
                {usage.planName} Plan
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-5">
            <div className="grid gap-6 md:grid-cols-3 text-xs mb-5">
              <div className="border p-4 rounded-xl flex flex-col justify-between bg-slate-50/50 border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Starter</span>
                  <span className="text-muted-foreground mt-1 block">For small farms just getting started.</span>
                </div>
                <span className="font-bold text-slate-700 mt-4 block">Free / Manual</span>
              </div>
              <div className="border-2 border-primary p-4 rounded-xl flex flex-col justify-between bg-primary/5/10 relative">
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-primary text-[8px] font-bold text-white uppercase tracking-wider">Active</span>
                <div>
                  <span className="font-bold text-primary text-sm block">Growth</span>
                  <span className="text-muted-foreground mt-1 block">Full automation for commercial growers.</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="font-bold text-primary">৳4,500/mo</span>
                </div>
              </div>
              <div className="border p-4 rounded-xl flex flex-col justify-between bg-slate-50/50 border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Enterprise</span>
                  <span className="text-muted-foreground mt-1 block">Multi-tenant hubs and priority SLA support.</span>
                </div>
                <span className="font-bold text-slate-700 mt-4 block">Custom Pricing</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t">
              <span className="text-xs text-muted-foreground">
                Plan renews on <span className="font-semibold text-slate-700">{usage.renewalDate}</span>
              </span>
              <Button onClick={handleUpgrade} size="sm" className="text-xs gap-1.5 cursor-pointer font-semibold shadow-sm">
                Upgrade Plan Space
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage Progress Indicators */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Resource Consumption</CardTitle>
            <CardDescription className="text-xs mt-0.5">Allocation limits according to active plan.</CardDescription>
          </CardHeader>
          <CardContent className="py-5 space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Seat Allocations</span>
                <span className="text-muted-foreground">{usage.usersUsed} / {usage.usersLimit} Users</span>
              </div>
              <Progress value={(usage.usersUsed / usage.usersLimit) * 100} className="h-1.5" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Regional Warehouses</span>
                <span className="text-muted-foreground">{usage.warehousesUsed} / {usage.warehousesLimit} Hubs</span>
              </div>
              <Progress value={(usage.warehousesUsed / usage.warehousesLimit) * 100} className="h-1.5" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Catalog SKU Limit</span>
                <span className="text-muted-foreground">{usage.productsUsed} / {usage.productsLimit} Products</span>
              </div>
              <Progress value={(usage.productsUsed / usage.productsLimit) * 100} className="h-1.5" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Secure Storage</span>
                <span className="text-muted-foreground">{usage.storageUsedGB}GB / {usage.storageLimitGB}GB</span>
              </div>
              <Progress value={(usage.storageUsedGB / usage.storageLimitGB) * 100} className="h-1.5" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">API Call Allowances</span>
                <span className="text-muted-foreground">{usage.apiUsed.toLocaleString()} / {usage.apiLimit.toLocaleString()} calls</span>
              </div>
              <Progress value={(usage.apiUsed / usage.apiLimit) * 100} className="h-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Audit Logs */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-800">System Audit Trail</CardTitle>
            <CardDescription className="text-xs mt-0.5">Immutable records of workspace operations.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={logs}
            columns={auditColumns}
            searchPlaceholder="Filter audit trail by action, module, or operator..."
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
