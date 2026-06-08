'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Boxes,
  Warehouse,
  Lock,
  AlertTriangle,
  Coins,
  Eye,
  FilterX,
  ArrowRightLeft,
  Sliders,
  History,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useInventory,
  useCreateInventory,
  useUpdateInventory,
  useWarehouses,
} from '@/services/query/hooks';
import { InventoryContract } from '@/types/contracts/inventory.contract';

export default function StockLevelsPage() {
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory();
  const { data: warehouses = [], isLoading: warehousesLoading } = useWarehouses();

  const createInventoryMutation = useCreateInventory();
  const updateInventoryMutation = useUpdateInventory('');

  // Page States
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [selectedStock, setSelectedStock] = useState<InventoryContract | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');

  // Operations Workspace States
  const [opType, setOpType] = useState<'adjustment' | 'transfer'>('adjustment');
  
  // Stock Adjustment Form
  const [adjustSku, setAdjustSku] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('STOCK_TAKE');

  // Stock Transfer Form
  const [transferSku, setTransferSku] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');

  // Mock Adjustment history logs
  const [recentAdjustments, setRecentAdjustments] = useState([
    { id: '1', sku: 'NPK-50KG-001', action: 'Adjustment', qty: '+50 units', reason: 'Stock Take audit', user: 'muzahid@agroai.com', date: '2026-06-08T11:20:00Z' },
    { id: '2', sku: 'PST-1L-002', action: 'Transfer', qty: '30 units', reason: 'Dhaka -> Bogura Hub', user: 'siddik.ali@agroai.com', date: '2026-06-08T09:45:00Z' },
  ]);

  // Filter inventory based on search and warehouse
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse = warehouseFilter === 'ALL' || item.warehouseId === warehouseFilter;
    return matchesSearch && matchesWarehouse;
  });

  // Unique warehouse options from loaded data
  const warehouseOptions = Array.from(
    new Map(inventory.map((item) => [item.warehouseId, item.warehouseName])).entries()
  );

  // Calculate stats based on filtered inventory
  const totalStock = filteredInventory.reduce((acc, curr) => acc + curr.totalStock, 0);
  const availableStock = filteredInventory.reduce((acc, curr) => acc + curr.availableStock, 0);
  const reservedStock = filteredInventory.reduce((acc, curr) => acc + curr.reservedStock, 0);
  const totalValuation = filteredInventory.reduce((acc, curr) => acc + curr.valuation, 0);
  const lowStockCount = filteredInventory.filter((item) => item.status === 'LOW_STOCK').length;

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustSku || !adjustQty) {
      toast.error('Complete all required fields');
      return;
    }
    const qtyNum = parseInt(adjustQty);
    if (isNaN(qtyNum)) {
      toast.error('Invalid quantity value');
      return;
    }

    try {
      const prod = inventory.find(i => i.sku === adjustSku);
      await createInventoryMutation.mutateAsync({
        sku: adjustSku,
        productName: prod?.productName || 'Adjusted SKU',
        warehouseId: prod?.warehouseId || 'wh_dhaka',
        warehouseName: prod?.warehouseName || 'Dhaka Warehouse Node',
        totalStock: qtyNum,
        availableStock: qtyNum,
        reservedStock: 0,
      });

      // Add to mock log
      const newLog = {
        id: `adj_${Date.now()}`,
        sku: adjustSku,
        action: 'Adjustment',
        qty: `${qtyNum > 0 ? '+' : ''}${qtyNum} units`,
        reason: adjustReason.replace('_', ' '),
        user: 'muzahid@agroai.com',
        date: new Date().toISOString(),
      };
      setRecentAdjustments([newLog, ...recentAdjustments]);
      
      toast.success('Stock level adjusted successfully!');
      setAdjustSku('');
      setAdjustQty('');
    } catch {
      toast.error('Failed to register stock level adjustment');
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSku || !transferQty || !fromWarehouseId || !toWarehouseId) {
      toast.error('Complete all transfer fields');
      return;
    }
    if (fromWarehouseId === toWarehouseId) {
      toast.error('Origin and Destination warehouse nodes must differ');
      return;
    }
    const qtyNum = parseInt(transferQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error('Quantity must be a positive integer');
      return;
    }

    try {
      const prod = inventory.find(i => i.sku === transferSku && i.warehouseId === fromWarehouseId);
      if (prod && prod.availableStock < qtyNum) {
        toast.error(`Insufficient stock. Only ${prod.availableStock} units available.`);
        return;
      }

      // Record transfer log
      const newLog = {
        id: `trsf_${Date.now()}`,
        sku: transferSku,
        action: 'Transfer',
        qty: `${qtyNum} units`,
        reason: `${warehouses.find(w=>w.id===fromWarehouseId)?.name || 'Origin'} ➔ ${warehouses.find(w=>w.id===toWarehouseId)?.name || 'Dest'}`,
        user: 'muzahid@agroai.com',
        date: new Date().toISOString(),
      };
      setRecentAdjustments([newLog, ...recentAdjustments]);
      toast.success('Inter-warehouse stock movement logged successfully!');
      
      setTransferSku('');
      setTransferQty('');
      setFromWarehouseId('');
      setToWarehouseId('');
    } catch {
      toast.error('Failed to log stock movement');
    }
  };

  const columns = [
    {
      header: 'SKU',
      accessor: (row: InventoryContract) => <span className="font-mono text-xs font-semibold">{row.sku}</span>,
    },
    {
      header: 'Product Name',
      accessor: (row: InventoryContract) => <span className="font-semibold text-foreground">{row.productName}</span>,
    },
    {
      header: 'Warehouse Node',
      accessor: (row: InventoryContract) => (
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Warehouse className="h-3.5 w-3.5" />
          {row.warehouseName}
        </span>
      ),
    },
    {
      header: 'Total Stock',
      accessor: (row: InventoryContract) => <span className="font-semibold">{row.totalStock} units</span>,
    },
    {
      header: 'Available',
      accessor: (row: InventoryContract) => <span className="text-emerald-600 font-medium">{row.availableStock} units</span>,
    },
    {
      header: 'Reserved',
      accessor: (row: InventoryContract) => (
        <span className={row.reservedStock > 0 ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
          {row.reservedStock} units
        </span>
      ),
    },
    {
      header: 'Valuation',
      accessor: (row: InventoryContract) => <span className="font-mono text-xs">৳{row.valuation.toLocaleString()}</span>,
    },
    {
      header: 'Stock Status',
      accessor: (row: InventoryContract) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: InventoryContract) => (
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
      className: 'text-right',
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Warehouse Stock Levels"
        description="Monitor physical stock counts, track locked reservations, and perform inventory movements."
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-neutral-100/50 dark:bg-neutral-900/50 p-1 border rounded-lg">
            <TabsTrigger value="grid" className="text-xs cursor-pointer">
              Stock Grid
            </TabsTrigger>
            <TabsTrigger value="ops" className="text-xs cursor-pointer flex items-center gap-1.5">
              <ArrowRightLeft className="h-3.5 w-3.5" /> Operations Workspace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Total Stock</span>
                  <Boxes className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStock}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Total physical units</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Available Stock</span>
                  <Warehouse className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{availableStock}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Available to promise</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Reserved Stock</span>
                  <Lock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{reservedStock}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Locked for pending orders</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Low Stock Nodes</span>
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-rose-600">{lowStockCount}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Needs immediate reorder</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
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
                      {warehouseOptions.map(([id, name]) => (
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
          </TabsContent>

          {/* Operations Workspace */}
          <TabsContent value="ops" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">Inventory Adjustments & Stock Movement</CardTitle>
                    <CardDescription className="text-xs">Register offline stock takes or transfer items between logistics hubs.</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded border">
                    <Button
                      variant={opType === 'adjustment' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setOpType('adjustment')}
                      className="text-xs h-7 px-2.5"
                    >
                      <Sliders className="h-3 w-3 mr-1" /> Adjustment
                    </Button>
                    <Button
                      variant={opType === 'transfer' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setOpType('transfer')}
                      className="text-xs h-7 px-2.5"
                    >
                      <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {opType === 'adjustment' ? (
                    <form onSubmit={handleCreateAdjustment} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Select Product SKU *</Label>
                          <Select value={adjustSku} onValueChange={setAdjustSku}>
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Select SKU..." />
                            </SelectTrigger>
                            <SelectContent>
                              {inventory.map((inv) => (
                                <SelectItem key={inv.sku} value={inv.sku} className="text-xs">
                                  {inv.sku} - {inv.productName} ({inv.warehouseName})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Adjustment Quantity *</Label>
                          <Input
                            placeholder="e.g. 50 (or -25 to reduce)"
                            value={adjustQty}
                            onChange={(e) => setAdjustQty(e.target.value)}
                            className="text-xs h-10"
                          />
                        </div>
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-xs">Reason for Adjustment</Label>
                        <Select value={adjustReason} onValueChange={setAdjustReason}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Select reason..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STOCK_TAKE" className="text-xs">Stock Take Audit</SelectItem>
                            <SelectItem value="DAMAGED_GOODS" className="text-xs">Damaged/Spoiled Goods</SelectItem>
                            <SelectItem value="SHRINKAGE" className="text-xs">Sourcing Shrinkage</SelectItem>
                            <SelectItem value="PROMOTIONAL" className="text-xs">Promotional Handout</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" className="text-xs h-10 w-full mt-2">
                        Execute Adjustment
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleCreateTransfer} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Origin Warehouse Node *</Label>
                          <Select value={fromWarehouseId} onValueChange={setFromWarehouseId}>
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Choose origin..." />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map((w) => (
                                <SelectItem key={w.id} value={w.id} className="text-xs">{w.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Destination Warehouse Node *</Label>
                          <Select value={toWarehouseId} onValueChange={setToWarehouseId}>
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Choose destination..." />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map((w) => (
                                <SelectItem key={w.id} value={w.id} className="text-xs">{w.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Product SKU to Move *</Label>
                          <Select value={transferSku} onValueChange={setTransferSku}>
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="Choose product..." />
                            </SelectTrigger>
                            <SelectContent>
                              {inventory
                                .filter(i => !fromWarehouseId || i.warehouseId === fromWarehouseId)
                                .map((item) => (
                                  <SelectItem key={item.sku} value={item.sku} className="text-xs">
                                    {item.sku} - {item.productName} (Avail: {item.availableStock})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Quantity to Transfer *</Label>
                          <Input
                            placeholder="Units count"
                            type="number"
                            min="1"
                            value={transferQty}
                            onChange={(e) => setTransferQty(e.target.value)}
                            className="text-xs h-10"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="text-xs h-10 w-full mt-2">
                        Execute Stock Transfer
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Adjustments & Operations Log */}
            <div className="space-y-6">
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                <CardHeader className="pb-3 border-b border-neutral-100 dark:border-neutral-900">
                  <CardTitle className="text-xs font-bold uppercase flex items-center gap-1.5">
                    <History className="h-4 w-4 text-neutral-500" /> Recent Adjustments Registry
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {recentAdjustments.map((log) => (
                      <div key={log.id} className="border-b last:border-b-0 pb-3 last:pb-0 text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-[10px] px-1.5 py-0.5 rounded text-neutral-700 dark:text-neutral-300">
                            {log.sku}
                          </span>
                          <span className={`font-semibold ${log.qty.startsWith('-') ? 'text-rose-500' : 'text-emerald-600'}`}>
                            {log.qty}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex justify-between">
                          <span>Reason: {log.reason}</span>
                          <span>{new Date(log.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-[9px] text-neutral-400 mt-0.5">
                          Authorized by: {log.user}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
