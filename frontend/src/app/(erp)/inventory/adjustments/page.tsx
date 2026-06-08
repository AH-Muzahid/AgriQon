'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { MOCK_ADJUSTMENTS, MockAdjustment } from '@/lib/mock-erp-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Eye, FileWarning, Sliders, User } from 'lucide-react';

export default function StockAdjustmentsPage() {
  const [adjustments] = useState<MockAdjustment[]>(MOCK_ADJUSTMENTS);
  const [search, setSearch] = useState('');
  const [selectedAdjustment, setSelectedAdjustment] = useState<MockAdjustment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter adjustments based on search
  const filteredAdjustments = adjustments.filter((a) => {
    return (
      a.productName.toLowerCase().includes(search.toLowerCase()) ||
      a.sku.toLowerCase().includes(search.toLowerCase()) ||
      a.reason.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getAdjustmentTypeBadge = (type: MockAdjustment['type']) => {
    switch (type) {
      case 'DAMAGE':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/10 gap-1 rounded-md py-0.5">
            <FileWarning className="h-3 w-3" />
            Damage Report
          </Badge>
        );
      case 'MANUAL':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10 gap-1 rounded-md py-0.5">
            <Sliders className="h-3 w-3" />
            Manual Audit
          </Badge>
        );
    }
  };

  const columns = [
    {
      header: 'Adjustment Date',
      accessor: (row: MockAdjustment) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.date).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Product Name',
      accessor: (row: MockAdjustment) => (
        <div className="grid gap-0.5">
          <span className="font-semibold text-foreground">{row.productName}</span>
          <span className="font-mono text-[10px] text-muted-foreground">SKU: {row.sku}</span>
        </div>
      ),
    },
    {
      header: 'Warehouse Node',
      accessor: (row: MockAdjustment) => (
        <span className="text-muted-foreground text-xs">{row.warehouseName}</span>
      ),
    },
    {
      header: 'Adjustment Type',
      accessor: (row: MockAdjustment) => getAdjustmentTypeBadge(row.type),
    },
    {
      header: 'Quantity Change',
      accessor: (row: MockAdjustment) => {
        const isNegative = row.quantity < 0;
        return (
          <span className={`font-bold font-mono text-sm ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isNegative ? '' : '+'}{row.quantity} units
          </span>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row: MockAdjustment) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedAdjustment(row);
            setSheetOpen(true);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>
      ),
      className: "text-right"
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Stock Adjustments"
        description="Verify damage reports, manual cycle count corrections, and warehouse discrepancies vouchers."
      >
        <DataTable
          data={filteredAdjustments}
          columns={columns}
          searchPlaceholder="Search adjustments by SKU, product, or reason..."
          searchValue={search}
          onSearchChange={setSearch}
          emptyStateTitle="No Adjustments Logs Found"
          emptyStateDescription="Manual overrides and damage reports will populate this log after physical audit checks."
        />
      </PageShell>

      {/* Adjustment Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedAdjustment && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedAdjustment.id}
                  </span>
                  {getAdjustmentTypeBadge(selectedAdjustment.type)}
                </div>
                <SheetTitle className="text-xl font-bold mt-2">{selectedAdjustment.productName}</SheetTitle>
                <SheetDescription>Detailed review of the stock count correction voucher.</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Warehouse Node</span>
                    <span className="font-medium text-xs">{selectedAdjustment.warehouseName}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Quantity Changed</span>
                    <span className={`font-mono font-bold ${selectedAdjustment.quantity < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {selectedAdjustment.quantity < 0 ? '' : '+'}{selectedAdjustment.quantity} units
                    </span>
                  </div>
                </div>

                <div className="border bg-slate-50 p-4 rounded-xl flex items-start gap-3 border-slate-200">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Auditor / Reporter</span>
                    <span className="font-semibold text-xs">{selectedAdjustment.reporter}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Reason / Notes</span>
                  <p className="text-xs leading-relaxed text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                    {selectedAdjustment.reason}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
