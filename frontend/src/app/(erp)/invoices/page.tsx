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
import { Eye, Plus, Coins, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_INVOICES, MOCK_ORDERS, MockInvoice } from '@/lib/mock-erp-data';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<MockInvoice[]>(MOCK_INVOICES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<MockInvoice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [orderId, setOrderId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalReceivables = invoices
    .filter((inv) => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + inv.dueAmount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.paidAmount, 0);
  const unpaidCount = invoices.filter((inv) => inv.status === 'UNPAID').length;
  const totalInvoicedAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  const handleIssueInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      toast.error('Please select a reference sales order');
      return;
    }
    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }

    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) return;

    // Check if invoice already exists for this order
    const alreadyExists = invoices.some((inv) => inv.orderId === orderId);
    if (alreadyExists) {
      toast.error(`An invoice already exists for order ${orderId}`);
      return;
    }

    const newInvoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: MockInvoice = {
      id: `inv_${Math.floor(Math.random() * 10000)}`,
      invoiceNo: newInvoiceNo,
      orderId: order.id,
      customerName: order.customerName,
      date: new Date().toISOString().split('T')[0],
      dueDate,
      totalAmount: order.totalAmount,
      paidAmount: 0,
      dueAmount: order.totalAmount,
      status: 'UNPAID',
    };

    setInvoices([newInvoice, ...invoices]);
    setCreateDialogOpen(false);
    toast.success(`Tax Invoice ${newInvoiceNo} generated successfully!`);

    // Reset Form
    setOrderId('');
    setDueDate('');
  };

  const columns = [
    {
      header: 'Invoice No',
      accessor: (row: MockInvoice) => (
        <span className="font-mono text-xs font-semibold">{row.invoiceNo}</span>
      ),
    },
    {
      header: 'Order Reference',
      accessor: (row: MockInvoice) => (
        <span className="font-mono text-xs text-muted-foreground">{row.orderId}</span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: (row: MockInvoice) => (
        <span className="font-semibold text-foreground">{row.customerName}</span>
      ),
    },
    {
      header: 'Issue Date',
      accessor: (row: MockInvoice) => (
        <span className="text-muted-foreground text-xs">{row.date}</span>
      ),
    },
    {
      header: 'Due Date',
      accessor: (row: MockInvoice) => (
        <span className="text-muted-foreground text-xs font-medium">{row.dueDate}</span>
      ),
    },
    {
      header: 'Invoiced Value',
      accessor: (row: MockInvoice) => (
        <span className="font-mono">৳{row.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      header: 'Due Balance',
      accessor: (row: MockInvoice) => (
        <span className={`font-mono font-semibold ${row.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          ৳{row.dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: MockInvoice) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: MockInvoice) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedInvoice(row);
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
        title="Customer Invoices"
        description="Issue tax-compliant bills, track receivables, and configure payment terms."
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                Issue Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Issue Tax Invoice</DialogTitle>
                <DialogDescription>
                  Generate a tax invoice from a confirmed sales order ledger.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleIssueInvoice} className="grid gap-4 py-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="order">Sales Order *</Label>
                  <Select value={orderId} onValueChange={setOrderId}>
                    <SelectTrigger className="w-full bg-background text-xs">
                      <SelectValue placeholder="Choose confirmed order..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_ORDERS.map((o) => (
                        <SelectItem key={o.id} value={o.id} className="text-xs">
                          {o.id} - {o.customerName} (৳{o.totalAmount.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="text-xs bg-background"
                  />
                </div>

                {orderId && (
                  <div className="border p-3 rounded-lg bg-slate-50 border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal Amount:</span>
                      <span className="font-mono font-semibold text-slate-700">
                        ৳{MOCK_ORDERS.find((o) => o.id === orderId)?.totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-1">
                      <span>Grand Total:</span>
                      <span className="font-mono text-primary">
                        ৳{MOCK_ORDERS.find((o) => o.id === orderId)?.totalAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!orderId || !dueDate}>
                    Issue Invoice
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Statistics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Receivables (Dues)</span>
              <Coins className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">
                ৳{totalReceivables.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Outstanding unpaid ledger sum</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Payments Collected</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ৳{totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Settled payments total</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Unpaid Invoices</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{unpaidCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Invoices awaiting settlement</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Invoiced Amount</span>
              <Receipt className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ৳{totalInvoicedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Historical sales billing total</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Data Table */}
        <DataTable
          data={filteredInvoices}
          columns={columns}
          searchPlaceholder="Search invoices by No, order ID, or customer..."
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
                  <SelectItem value="PAID" className="text-xs">Paid</SelectItem>
                  <SelectItem value="UNPAID" className="text-xs">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL" className="text-xs">Partial</SelectItem>
                  <SelectItem value="OVERDUE" className="text-xs">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          emptyStateTitle="No Invoices Issued"
          emptyStateDescription="Log wholesale orders first and issue billing records to capture outstanding due balances."
        />
      </PageShell>

      {/* Invoice Detail Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedInvoice && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedInvoice.invoiceNo}
                  </span>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">Tax Invoice Details</SheetTitle>
                <span className="text-xs text-muted-foreground">
                  Reference Order: <span className="font-mono font-semibold">{selectedInvoice.orderId}</span>
                </span>
              </SheetHeader>

              <div className="py-6 space-y-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Customer Account</span>
                  <div className="font-semibold text-slate-700">{selectedInvoice.customerName}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Issue Date</span>
                    <span className="font-medium">{selectedInvoice.date}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Due Date</span>
                    <span className="font-medium text-rose-600">{selectedInvoice.dueDate}</span>
                  </div>
                </div>

                <div className="border p-4 rounded-xl bg-slate-50 border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">Ledger Balance Statement</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Invoiced Grand Total:</span>
                      <span className="font-mono font-medium text-slate-700">
                        ৳{selectedInvoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Paid Amount:</span>
                      <span className="font-mono font-medium text-emerald-600">
                        ৳{selectedInvoice.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2 text-sm">
                      <span>Remaining Balance Due:</span>
                      <span className={`font-mono ${selectedInvoice.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ৳{selectedInvoice.dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    variant="outline"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => {
                      toast.info(`Mock Print trigger for ${selectedInvoice.invoiceNo}`);
                    }}
                  >
                    Print Invoice PDF
                  </Button>
                </div>
              </div>
            </React.Fragment>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
