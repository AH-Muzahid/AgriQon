'use client';

import React from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Warehouse, TrendingDown, DollarSign, PackageCheck, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function InventoryReportsPage() {
  const warehouseStocks = [
    { name: 'Dhaka Central Hub', valuation: 526500, stockCount: 281, capacity: 75 },
    { name: 'Bogura Cold Storage', valuation: 104500, stockCount: 230, capacity: 45 },
  ];

  const handleExportValuation = () => {
    toast.success('Inventory Valuation report generated successfully!');
  };

  return (
    <PageShell
      title="Inventory Reports"
      description="Stock turn rates, aging reports, storage usage, and dead stock assessments."
      actions={
        <Button className="text-xs" onClick={handleExportValuation}>
          <Download className="mr-2 h-4 w-4" />
          Export Valuation PDF
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Inventory Valuation</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">৳631,000.00</div>
            <p className="text-[10px] text-muted-foreground mt-1">Valuation at cost price margin</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Stock Available</span>
            <PackageCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">511 Units</div>
            <p className="text-[10px] text-muted-foreground mt-1">Across 6 active SKUs</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Low Stock Alerts</span>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">2 Alerts</div>
            <p className="text-[10px] text-muted-foreground mt-1">Organic Compost & Pesticides</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Active Warehouses</span>
            <Warehouse className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 Hubs</div>
            <p className="text-[10px] text-muted-foreground mt-1">Dhaka & Bogura regional storage</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Warehouse Valuation Breakdown */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800 font-sans">Warehouse Stock Share</CardTitle>
            <span className="text-xs text-muted-foreground">Distribution of active assets by location.</span>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            {warehouseStocks.map((wh, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{wh.name}</span>
                  <span className="font-mono text-slate-800">
                    ৳{wh.valuation.toLocaleString()} ({wh.stockCount} units)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${(wh.valuation / 631000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Storage Space Capacity Utilization */}
        <Card className="border shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800 font-sans">Storage Space Utilization</CardTitle>
            <span className="text-xs text-muted-foreground">Current volume capacity thresholds.</span>
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            {warehouseStocks.map((wh, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{wh.name}</span>
                  <span className="text-slate-500">{wh.capacity}% Filled</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${wh.capacity > 70 ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${wh.capacity}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
