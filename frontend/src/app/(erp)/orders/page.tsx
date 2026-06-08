'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Plus, ShoppingCart, TrendingUp, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_PRODUCTS, MockOrder } from '@/lib/mock-erp-data';

export default function OrdersPage() {
  const [orders, setOrders] = useState<MockOrder[]>(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<MockOrder | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states for creating a new sales order
  const [customerId, setCustomerId] = useState('');
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [orderItems, setOrderItems] = useState<{ sku: string; name: string; qty: number; price: number }[]>([]);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate order stats
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Add item to temporary order creation list
  const handleAddItem = () => {
    if (!selectedSku) {
      toast.error('Please select a product SKU');
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Quantity must be a positive integer');
      return;
    }

    const product = MOCK_PRODUCTS.find((p) => p.sku === selectedSku);
    if (!product) return;

    // Check if item already exists in temp list
    const existingIndex = orderItems.findIndex((item) => item.sku === selectedSku);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].qty += qty;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          sku: product.sku,
          name: product.name,
          qty,
          price: product.sellingPrice,
        },
      ]);
    }

    setSelectedSku('');
    setQuantity('1');
    toast.success(`Added ${product.name} (x${qty})`);
  };

  // Remove item from temporary list
  const handleRemoveItem = (index: number) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  // Submit new order form
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (orderItems.length === 0) {
      toast.error('Add at least one item to the order');
      return;
    }

    const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId);
    if (!customer) return;

    const totalAmount = orderItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    const newOrderId = `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: MockOrder = {
      id: newOrderId,
      date: new Date().toISOString(),
      customerId: customer.id,
      customerName: customer.name,
      totalAmount,
      status: 'PENDING',
      items: orderItems,
      timeline: [
        {
          date: new Date().toISOString(),
          status: 'PENDING',
          desc: 'Sales order drafted and submitted via ERP portal.',
        },
      ],
    };

    setOrders([newOrder, ...orders]);
    setCreateDialogOpen(false);
    toast.success(`Sales Order ${newOrderId} created successfully!`);

    // Reset Form
    setCustomerId('');
    setSelectedSku('');
    setQuantity('1');
    setOrderItems([]);
  };

  const columns = [
    {
      header: 'Order ID',
      accessor: (row: MockOrder) => (
        <span className="font-mono text-xs font-semibold">{row.id}</span>
      ),
    },
    {
      header: 'Date Logged',
      accessor: (row: MockOrder) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: (row: MockOrder) => (
        <span className="font-semibold text-foreground">{row.customerName}</span>
      ),
    },
    {
      header: 'Item Count',
      accessor: (row: MockOrder) => (
        <span className="text-muted-foreground text-xs">
          {row.items.reduce((acc, curr) => acc + curr.qty, 0)} units ({row.items.length} line items)
        </span>
      ),
    },
    {
      header: 'Total Invoice Value',
      accessor: (row: MockOrder) => (
        <span className="font-mono font-semibold">
          ৳{row.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: MockOrder) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: MockOrder) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedOrder(row);
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
        title="Sales Orders"
        description="Process retail purchases, bulk shipments, and marketplace contracts."
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                New Sales Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Draft New Sales Order</DialogTitle>
                <DialogDescription>
                  Record offline wholesale orders and lock warehouse catalog units.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateOrder} className="grid gap-4 py-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="customer">Client Account *</Label>
                  <Select value={customerId} onValueChange={setCustomerId}>
                    <SelectTrigger className="w-full bg-background text-xs">
                      <SelectValue placeholder="Select customer profile..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_CUSTOMERS.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.name} ({c.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border p-4 rounded-lg bg-slate-50/50 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Add Line Items</span>
                  <div className="grid grid-cols-5 gap-3 items-end">
                    <div className="col-span-3 grid gap-1">
                      <Label htmlFor="sku" className="text-[10px] uppercase font-bold text-muted-foreground">Product SKU</Label>
                      <Select value={selectedSku} onValueChange={setSelectedSku}>
                        <SelectTrigger className="bg-background text-xs">
                          <SelectValue placeholder="Choose product..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MOCK_PRODUCTS.filter((p) => p.status === 'ACTIVE').map((p) => (
                            <SelectItem key={p.sku} value={p.sku} className="text-xs">
                              {p.sku} - {p.name} (৳{p.sellingPrice})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-1">
                      <Label htmlFor="qty" className="text-[10px] uppercase font-bold text-muted-foreground">Qty</Label>
                      <Input
                        id="qty"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="bg-background text-xs"
                      />
                    </div>

                    <Button type="button" variant="secondary" onClick={handleAddItem} className="w-full text-xs">
                      Add
                    </Button>
                  </div>

                  {/* Temp items table */}
                  {orderItems.length > 0 && (
                    <div className="border rounded-md bg-background overflow-hidden max-h-40 overflow-y-auto mt-2">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase border-b">
                          <tr>
                            <th className="p-2">Item</th>
                            <th className="p-2 text-right">Qty</th>
                            <th className="p-2 text-right">Price</th>
                            <th className="p-2 text-right">Total</th>
                            <th className="p-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orderItems.map((item, index) => (
                            <tr key={index}>
                              <td className="p-2 font-medium">{item.name}</td>
                              <td className="p-2 text-right">{item.qty}</td>
                              <td className="p-2 text-right font-mono">৳{item.price.toFixed(2)}</td>
                              <td className="p-2 text-right font-mono font-semibold">
                                ৳{(item.qty * item.price).toFixed(2)}
                              </td>
                              <td className="p-2 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(index)}
                                  className="h-6 w-6 text-destructive cursor-pointer hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {orderItems.length > 0 && (
                    <div className="flex justify-between items-center text-xs font-semibold pt-1">
                      <span>Order Subtotal:</span>
                      <span className="font-mono text-sm text-primary">
                        ৳{orderItems.reduce((s, i) => s + i.qty * i.price, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateDialogOpen(false);
                      setOrderItems([]);
                      setCustomerId('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={orderItems.length === 0}>
                    Place Order
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Sales Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Approvals</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Orders requiring validation</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">In Sourcing / Processing</span>
              <ShoppingCart className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{processingCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Confirmed orders in queue</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Delivered Orders</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{deliveredCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Successful fulfilled handovers</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Cumulative Value</span>
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ৳{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Total revenue booked</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <DataTable
          data={filteredOrders}
          columns={columns}
          searchPlaceholder="Search sales orders by ID or customer..."
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
                  <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
                  <SelectItem value="CONFIRMED" className="text-xs">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING" className="text-xs">Processing</SelectItem>
                  <SelectItem value="DELIVERED" className="text-xs">Delivered</SelectItem>
                  <SelectItem value="CANCELLED" className="text-xs">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          emptyStateTitle="No Sales Orders"
          emptyStateDescription="New sales orders registered in the system will be displayed here."
        />
      </PageShell>

      {/* Order Details Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedOrder && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedOrder.id}
                  </span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">Order Breakdown</SheetTitle>
                <span className="text-xs text-muted-foreground">
                  Logged on {new Date(selectedOrder.date).toLocaleString()}
                </span>
              </SheetHeader>

              <div className="py-6 space-y-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Customer Profile</span>
                  <div className="font-semibold text-slate-700">{selectedOrder.customerName}</div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Order Details</span>
                  <div className="border rounded-lg bg-slate-50/50 overflow-hidden border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/80 border-b font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-3">SKU / Item Name</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3">
                              <span className="font-mono text-[10px] text-muted-foreground block">{item.sku}</span>
                              <span className="font-medium">{item.name}</span>
                            </td>
                            <td className="p-3 text-right font-medium">{item.qty}</td>
                            <td className="p-3 text-right font-mono font-semibold text-slate-700">
                              ৳{(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100/30 font-bold">
                          <td className="p-3 text-right" colSpan={2}>Grand Total</td>
                          <td className="p-3 text-right font-mono text-primary">
                            ৳{selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-3">Workflow Timeline</span>
                  <div className="relative border-l pl-4 ml-2 space-y-4 text-xs">
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="relative">
                        <span className="absolute -left-[21px] top-0.5 size-2.5 rounded-full border bg-white border-primary" />
                        <div className="grid gap-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(event.date).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <StatusBadge status={event.status} />
                          </div>
                          <span className="text-muted-foreground text-xs mt-0.5">{event.desc}</span>
                        </div>
                      </div>
                    ))}
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
