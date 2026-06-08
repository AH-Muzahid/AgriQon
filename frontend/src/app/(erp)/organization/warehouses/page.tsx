'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Eye, Warehouse, Sliders, CheckCircle2, AlertTriangle, MapPin, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_WAREHOUSES, MockWarehouse } from '@/lib/mock-erp-data';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<MockWarehouse[]>(MOCK_WAREHOUSES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<MockWarehouse | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [newWh, setNewWh] = useState({
    name: '',
    code: '',
    manager: '',
    address: '',
    capacity: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const filteredWh = warehouses.filter((wh) => {
    const matchesSearch =
      wh.name.toLowerCase().includes(search.toLowerCase()) ||
      wh.code.toLowerCase().includes(search.toLowerCase()) ||
      wh.manager.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || wh.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCapacity = warehouses.reduce((acc, curr) => acc + curr.capacity, 0);
  const totalUsedCapacity = warehouses.reduce((acc, curr) => acc + curr.usedCapacity, 0);
  const averageUtil = totalCapacity > 0 ? (totalUsedCapacity / totalCapacity) * 100 : 0;

  // Find warehouses operating near limit (utilization > 70%)
  const lowCapacityWarehouses = warehouses.filter(
    (w) => w.capacity > 0 && (w.usedCapacity / w.capacity) * 100 > 70
  );

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWh.name || !newWh.code || !newWh.manager || !newWh.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const created: MockWarehouse = {
      id: `wh_${newWh.code.toLowerCase()}`,
      name: newWh.name,
      code: newWh.code,
      manager: newWh.manager,
      address: newWh.address || 'Not specified',
      capacity: parseInt(newWh.capacity),
      usedCapacity: 0,
      status: newWh.status,
    };

    setWarehouses([...warehouses, created]);
    setCreateDialogOpen(false);
    toast.success(`Warehouse ${created.name} registered successfully`);

    // Reset Form
    setNewWh({
      name: '',
      code: '',
      manager: '',
      address: '',
      capacity: '',
      status: 'ACTIVE',
    });
  };

  const columns = [
    {
      header: 'Code',
      accessor: (row: MockWarehouse) => (
        <span className="font-mono text-xs font-semibold text-muted-foreground">{row.code}</span>
      ),
    },
    {
      header: 'Warehouse Name',
      accessor: (row: MockWarehouse) => (
        <span className="font-semibold text-foreground">{row.name}</span>
      ),
    },
    {
      header: 'Manager',
      accessor: (row: MockWarehouse) => (
        <span className="text-slate-700">{row.manager}</span>
      ),
    },
    {
      header: 'Capacity (MT)',
      accessor: (row: MockWarehouse) => (
        <span className="font-mono">{row.capacity} MT</span>
      ),
    },
    {
      header: 'Used Stock',
      accessor: (row: MockWarehouse) => (
        <div className="w-40 space-y-1">
          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
            <span>{row.usedCapacity} MT used</span>
            <span>{Math.round((row.usedCapacity / row.capacity) * 100)}%</span>
          </div>
          <Progress value={(row.usedCapacity / row.capacity) * 100} className="h-1" />
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: MockWarehouse) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: MockWarehouse) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedWarehouse(row);
            setSheetOpen(true);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Warehouse Settings"
        description="Configure regional stocking locations, assign branch codes, manager roles, and capacity targets."
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                Register Warehouse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register Warehouse Hub</DialogTitle>
                <DialogDescription>
                  Define a new logistics warehouse sector to capture catalog stock levels.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWarehouse} className="grid gap-4 py-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">Warehouse Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Jessore Cold Storage"
                      value={newWh.name}
                      onChange={(e) => setNewWh({ ...newWh, name: e.target.value })}
                      required
                      className="text-xs bg-background"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="code" className="text-xs font-semibold">Branch Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g. WH-JES-03"
                      value={newWh.code}
                      onChange={(e) => setNewWh({ ...newWh, code: e.target.value })}
                      required
                      className="text-xs bg-background font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="manager" className="text-xs font-semibold">Manager Operator *</Label>
                    <Input
                      id="manager"
                      placeholder="e.g. Salim Khan"
                      value={newWh.manager}
                      onChange={(e) => setNewWh({ ...newWh, manager: e.target.value })}
                      required
                      className="text-xs bg-background"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="capacity" className="text-xs font-semibold">Capacity Limit (MT) *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="e.g. 500"
                      value={newWh.capacity}
                      onChange={(e) => setNewWh({ ...newWh, capacity: e.target.value })}
                      required
                      className="text-xs bg-background font-mono"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold">Postal Location Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g. Palbari Intersection, Jessore"
                    value={newWh.address}
                    onChange={(e) => setNewWh({ ...newWh, address: e.target.value })}
                    className="text-xs bg-background"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="status" className="text-xs font-semibold">Active Status</Label>
                  <Select
                    value={newWh.status}
                    onValueChange={(val) => setNewWh({ ...newWh, status: val as 'ACTIVE' | 'INACTIVE' })}
                  >
                    <SelectTrigger className="w-full bg-background text-xs">
                      <SelectValue placeholder="Choose status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
                      <SelectItem value="INACTIVE" className="text-xs">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Register Hub</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Capacity Cards & Low Warning */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Aggregated Storage Limit</span>
              <Warehouse className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity} MT</div>
              <p className="text-[10px] text-muted-foreground mt-1">Sum of all warehouse boundaries</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Capacity Filled</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {totalUsedCapacity} MT ({Math.round(averageUtil)}% utilization)
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Active stocked inventory weights</p>
            </CardContent>
          </Card>

          <Card className={`border shadow-sm ${lowCapacityWarehouses.length > 0 ? 'bg-amber-50/30 border-amber-200' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Low Storage Notices</span>
              <ShieldAlert className={`h-4 w-4 ${lowCapacityWarehouses.length > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${lowCapacityWarehouses.length > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                {lowCapacityWarehouses.length} Alert{lowCapacityWarehouses.length === 1 ? '' : 's'}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {lowCapacityWarehouses.length > 0 ? 'Hubs exceeding 70% threshold' : 'All spaces operating optimally'}
              </p>
            </CardContent>
          </Card>
        </div>

        {lowCapacityWarehouses.length > 0 && (
          <div className="mb-6 flex gap-3 items-center border border-amber-200 bg-amber-50/50 p-4 rounded-xl text-xs text-amber-800">
            <AlertTriangle className="size-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold">Capacity warnings reported:</span> Dhaka Central Warehouse is currently operating at{' '}
              <span className="font-bold">75% capacity</span>. Please inspect inventory velocity reports to schedule restocking.
            </div>
          </div>
        )}

        <DataTable
          data={filteredWh}
          columns={columns}
          searchPlaceholder="Search warehouses by name, branch code, manager..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 h-10 bg-background text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                  <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
                  <SelectItem value="INACTIVE" className="text-xs">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          emptyStateTitle="No Warehouses Found"
          emptyStateDescription="Add logistics hubs to begin sorting products and catalog quantities."
        />
      </PageShell>

      {/* Warehouse Detail Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedWarehouse && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedWarehouse.code}
                  </span>
                  <StatusBadge status={selectedWarehouse.status} />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">{selectedWarehouse.name}</SheetTitle>
                <SheetDescription>Logistics hub capacity profile and assignments.</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Manager Operator</span>
                    <span className="font-medium text-slate-800">{selectedWarehouse.manager}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Capacity Limit</span>
                    <span className="font-mono font-medium text-slate-800">{selectedWarehouse.capacity} Metric Tons</span>
                  </div>
                </div>

                <div className="space-y-2 border-b pb-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Active Storage Consumption</span>
                    <span className="font-mono">
                      {selectedWarehouse.usedCapacity} MT / {selectedWarehouse.capacity} MT (
                      {Math.round((selectedWarehouse.usedCapacity / selectedWarehouse.capacity) * 100)}%)
                    </span>
                  </div>
                  <Progress
                    value={(selectedWarehouse.usedCapacity / selectedWarehouse.capacity) * 100}
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase block flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-slate-400" />
                    Postal Location
                  </span>
                  <p className="text-xs text-muted-foreground bg-slate-50 border p-3 rounded-lg leading-relaxed">
                    {selectedWarehouse.address}
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
