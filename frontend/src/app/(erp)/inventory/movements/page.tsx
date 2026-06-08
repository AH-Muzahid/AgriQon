'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { MOCK_MOVEMENTS, MockMovement } from '@/lib/mock-erp-data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, Sliders, RotateCcw, RefreshCw, FilterX } from 'lucide-react';

export default function StockMovementsPage() {
  const [movements] = useState<MockMovement[]>(MOCK_MOVEMENTS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Filter movements based on search and type
  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.reference.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getMovementTypeBadge = (type: MockMovement['type']) => {
    switch (type) {
      case 'IN':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 gap-1 rounded-md py-0.5">
            <ArrowDownLeft className="h-3 w-3" />
            Inbound (IN)
          </Badge>
        );
      case 'OUT':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/10 gap-1 rounded-md py-0.5">
            <ArrowUpRight className="h-3 w-3" />
            Outbound (OUT)
          </Badge>
        );
      case 'TRANSFER':
        return (
          <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/10 gap-1 rounded-md py-0.5">
            <RefreshCw className="h-3 w-3" />
            Transfer
          </Badge>
        );
      case 'ADJUSTMENT':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10 gap-1 rounded-md py-0.5">
            <Sliders className="h-3 w-3" />
            Adjustment
          </Badge>
        );
      case 'RETURN':
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/10 gap-1 rounded-md py-0.5">
            <RotateCcw className="h-3 w-3" />
            Return
          </Badge>
        );
    }
  };

  const columns = [
    {
      header: 'Date & Time',
      accessor: (row: MockMovement) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.date).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Product Name',
      accessor: (row: MockMovement) => (
        <div className="grid gap-0.5">
          <span className="font-semibold text-foreground">{row.productName}</span>
          <span className="font-mono text-[10px] text-muted-foreground">SKU: {row.sku}</span>
        </div>
      ),
    },
    {
      header: 'Warehouse Node',
      accessor: (row: MockMovement) => (
        <span className="text-muted-foreground text-xs">{row.warehouseName}</span>
      ),
    },
    {
      header: 'Movement Type',
      accessor: (row: MockMovement) => getMovementTypeBadge(row.type),
    },
    {
      header: 'Quantity Change',
      accessor: (row: MockMovement) => {
        const isNegative = row.quantity < 0 || row.type === 'OUT';
        return (
          <span className={`font-bold font-mono text-sm ${isNegative ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isNegative ? '' : '+'}{row.quantity} units
          </span>
        );
      },
    },
    {
      header: 'Reference Code',
      accessor: (row: MockMovement) => (
        <span className="font-mono text-xs text-muted-foreground">{row.reference}</span>
      ),
    },
  ];

  return (
    <PageShell
      title="Stock Movements & Ledger"
      description="Historical log of stock receipts, shipments, transfers, and corrections across warehouse nodes."
    >
      <DataTable
        data={filteredMovements}
        columns={columns}
        searchPlaceholder="Search product, SKU, or reference code..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 h-10 bg-background text-xs">
                <SelectValue placeholder="All Movement Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL" className="text-xs">All Types</SelectItem>
                <SelectItem value="IN" className="text-xs">Inbound (IN)</SelectItem>
                <SelectItem value="OUT" className="text-xs">Outbound (OUT)</SelectItem>
                <SelectItem value="TRANSFER" className="text-xs">Transfer</SelectItem>
                <SelectItem value="ADJUSTMENT" className="text-xs">Adjustment</SelectItem>
                <SelectItem value="RETURN" className="text-xs">Return</SelectItem>
              </SelectContent>
            </Select>
            {typeFilter !== 'ALL' && (
              <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive cursor-pointer" onClick={() => setTypeFilter('ALL')}>
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        }
        emptyStateTitle="No Movements Logged"
        emptyStateDescription="Operational activities such as inbounding, outbounding, and stock transfers will populate the ledger automatically."
      />
    </PageShell>
  );
}
