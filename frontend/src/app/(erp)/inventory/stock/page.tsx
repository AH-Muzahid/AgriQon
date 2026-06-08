'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_INVENTORY, MockInventory } from '@/lib/mock-erp-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Boxes, Warehouse, Lock, AlertTriangle, Coins, Eye, FilterX } from 'lucide-react';

export default function StockLevelsPage() {
  const [inventory, setInventory] = useState<MockInventory[]>(MOCK_INVENTORY);
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [selectedStock, setSelectedStock] = useState<MockInventory | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter inventory based on search and warehouse
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse = warehouseFilter === 'ALL' || item.warehouseId === warehouseFilter;
    return matchesSearch && matchesWarehouse;
  });

  const warehouses = Array.from(
    new Map(inventory.map((item) => [item.warehouseId, item.warehouseName])).entries()
  );

  // Calculate stats based on filtered inventory
  const totalStock = filteredInventory.reduce((acc, curr) => acc + curr.totalStock, 0);
  const availableStock = filteredInventory.reduce((acc, curr) => acc + curr.availableStock, 0);
  const reservedStock = filteredInventory.reduce((acc, curr) => acc + curr.reservedStock, 0);
  const totalValuation = filteredInventory.reduce((acc, curr) => acc + curr.valuation, 0);
  const lowStockCount = filteredInventory.filter((item) => item.status === 'LOW_STOCK').length;

  const columns = [
    {
      header: 'SKU',
      accessor: (row: MockInventory) => (
        <span className="font-mono text-xs font-semibold">{row.sku}</span>
      ),
    },
    {
      header: 'Product Name',
      accessor: (row: MockInventory) => (
        <span className="font-semibold text-foreground">{row.productName}</span>
      ),
    },
    {
      header: 'Warehouse Node',
      accessor: (row: MockInventory) => (
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Warehouse className="h-3.5 w-3.5" />
          {row.warehouseName}
        </span>
      ),
    },
    {
      header: 'Total Stock',
      accessor: (row: MockInventory) => (
        <span className="font-semibold">{row.totalStock} units</span>
      ),
    },
    {
      header: 'Available',
      accessor: (row: MockInventory) => (
        <span className="text-emerald-600 font-medium">{row.availableStock} units</span>
      ),
    },
    {
      header: 'Reserved',
      accessor: (row: MockInventory) => (
        <span className={row.reservedStock > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
          {row.reservedStock} units
        </span>
      ),
    },
    {
      header: 'Valuation',
      accessor: (row: MockInventory) => (
        <span className="font-mono text-xs">৳{row.valuation.toLocaleString()}</span>
      ),
    },
    {
      header: 'Stock Status',
      accessor: (row: MockInventory) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: MockInventory) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedStock(row);
            setSheetOpen(true);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          Audit Sheet
        </Button>
      ),
      className: "text-right"
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Warehouse Stock Levels"
        description="Monitor physical stock counts, track locked reservations, and audit asset valuations across hubs."
      >
        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Stock</span>
              <Boxes className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Total physical units</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Available Stock</span>
              <Warehouse className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{availableStock}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Available to promise</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Reserved Stock</span>
              <Lock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{reservedStock}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Locked for pending orders</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Low Stock Nodes</span>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">{lowStockCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Needs immediate reorder</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Inventory Value</span>
              <Coins className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{totalValuation.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Current assets valuation</p>
            </CardContent>
          </Card>
        </div>

        {/* DataTable */}
        <DataTable
          data={filteredInventory}
          columns={columns}
          searchPlaceholder="Search stock SKU or name..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={
            <div className="flex items-center gap-2">
              <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                <SelectTrigger className="w-48 h-10 bg-background text-xs">
                  <SelectValue placeholder="All Warehouses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Warehouses</SelectItem>
                  {warehouses.map(([id, name]) => (
                    <SelectItem key={id} value={id} className="text-xs">{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {warehouseFilter !== 'ALL' && (
                <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive cursor-pointer" onClick={() => setWarehouseFilter('ALL')}>
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          }
          emptyStateTitle="No Stock Levels Found"
          emptyStateDescription="Ensure you have registered physical warehouses and recorded goods received vouchers."
        />
      </PageShell>

      {/* Stock Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedStock && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedStock.sku}
                  </span>
                  <StatusBadge status={selectedStock.status} />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">{selectedStock.productName}</SheetTitle>
                <SheetDescription>Physical stock audit data for this warehouse node.</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6 text-sm">
                <div className="border bg-muted/20 p-4 rounded-xl flex items-center gap-3">
                  <Warehouse className="h-5 w-5 text-primary" />
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Location Node</span>
                    <span className="font-semibold">{selectedStock.warehouseName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-b pb-4">
                  <div className="text-center bg-slate-50 p-3 rounded-lg border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Total</span>
                    <span className="text-lg font-bold">{selectedStock.totalStock}</span>
                  </div>
                  <div className="text-center bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase block">Available</span>
                    <span className="text-lg font-bold">{selectedStock.availableStock}</span>
                  </div>
                  <div className="text-center bg-amber-50 text-amber-700 p-3 rounded-lg border border-amber-100">
                    <span className="text-[10px] font-bold text-amber-600 uppercase block">Reserved</span>
                    <span className="text-lg font-bold">{selectedStock.reservedStock}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Asset Valuation</span>
                    <span className="font-mono text-base font-bold text-primary">
                      ৳{selectedStock.valuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Stocking Rate</span>
                    <span className="font-medium text-xs">
                      {((selectedStock.availableStock / selectedStock.totalStock) * 100).toFixed(0)}% available
                    </span>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
