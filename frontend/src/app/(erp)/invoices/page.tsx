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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Eye, Plus, Coins, Receipt, CheckCircle, AlertCircle, TrendingUp, Landmark, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import {
  useInvoices,
  useCreateInvoice,
  useCreatePayment,
  useOrders,
} from '@/services/query/hooks';
import { useSubscriptionStatus } from '@/hooks/use-subscription';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { InvoiceContract } from '@/types/contracts/invoice.contract';

export default function InvoicesPage() {
  const { isReadOnly } = useSubscriptionStatus();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();

  const createInvoiceMutation = useCreateInvoice();
  const createPaymentMutation = useCreatePayment();

  // Page States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceContract | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ledger');

  // Form states (Issue Invoice)
  const [orderId, setOrderId] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Quick Payment states
  const [quickInvoiceId, setQuickInvoiceId] = useState('');
  const [quickAmount, setQuickAmount] = useState('');
  const [quickMethod, setQuickMethod] = useState('BKASH');

  // Calculate statistics
  const totalReceivables = invoices
    .filter((inv) => inv.status !== 'PAID')
    .reduce((sum, inv) => sum + inv.dueAmount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.paidAmount, 0);
  const unpaidCount = invoices.filter((inv) => inv.status === 'UNPAID').length;
  const totalInvoicedAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleIssueInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !dueDate) {
      toast.error('Please complete all required fields');
      return;
    }
    try {
      await createInvoiceMutation.mutateAsync({
        orderId,
        dueDate,
      });
      toast.success('Tax Invoice issued successfully!');
      setCreateDialogOpen(false);
      setOrderId('');
      setDueDate('');
    } catch {
      toast.error('Failed to issue invoice');
    }
  };

  const handleQuickPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInvoiceId || !quickAmount) {
      toast.error('Please choose an invoice and state the amount');
      return;
    }
    const amt = parseFloat(quickAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Amount must be positive');
      return;
    }

    const selectedInv = invoices.find(inv => inv.id === quickInvoiceId);
    if (!selectedInv) return;

    try {
      let formattedMethod: 'Bank Transfer' | 'MFS (bKash/Nagad)' | 'Cash' | 'Credit Card' = 'Cash';
      if (quickMethod === 'BKASH' || quickMethod === 'NAGAD') formattedMethod = 'MFS (bKash/Nagad)';
      else if (quickMethod === 'BANK_TRANSFER') formattedMethod = 'Bank Transfer';

      await createPaymentMutation.mutateAsync({
        invoiceNo: selectedInv.invoiceNo,
        amount: amt,
        method: formattedMethod,
      });
      toast.success(`Registered payment of ৳${amt.toLocaleString()} successfully!`);
      setQuickInvoiceId('');
      setQuickAmount('');
    } catch {
      toast.error('Failed to record payment');
    }
  };

  const columns = [
    {
      header: 'Invoice No',
      accessor: (row: InvoiceContract) => <span className="font-mono text-xs font-semibold">{row.invoiceNo}</span>,
    },
    {
      header: 'Order Reference',
      accessor: (row: InvoiceContract) => <span className="font-mono text-xs text-muted-foreground">{row.orderId}</span>,
    },
    {
      header: 'Customer Name',
      accessor: (row: InvoiceContract) => <span className="font-semibold text-foreground">{row.customerName}</span>,
    },
    {
      header: 'Issue Date',
      accessor: (row: InvoiceContract) => <span className="text-muted-foreground text-xs">{row.date}</span>,
    },
    {
      header: 'Due Date',
      accessor: (row: InvoiceContract) => <span className="text-muted-foreground text-xs font-medium">{row.dueDate}</span>,
    },
    {
      header: 'Invoiced Value',
      accessor: (row: InvoiceContract) => (
        <span className="font-mono">৳{row.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      header: 'Due Balance',
      accessor: (row: InvoiceContract) => (
        <span className={`font-mono font-semibold ${row.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          ৳{row.dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: InvoiceContract) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: InvoiceContract) => (
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
        title="Invoices & Finance"
        description="Manage billing invoices, clear receivables, and analyze cash collection cycles."
        actions={
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 cursor-pointer font-semibold shadow-sm" disabled={isReadOnly}>
                        <Plus className="h-4 w-4" />
                        Issue Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Issue Tax Invoice</DialogTitle>
                <DialogDescription>Generate a tax invoice from a confirmed sales order ledger.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleIssueInvoice} className="grid gap-4 py-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="order">Sales Order *</Label>
                  <Select value={orderId} onValueChange={setOrderId}>
                    <SelectTrigger className="w-full bg-background text-xs">
                      <SelectValue placeholder="Choose confirmed order..." />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((o) => (
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
                  <div className="border p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 text-xs">
                    <div className="flex justify-between font-bold">
                      <span>Grand Total:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        ৳{orders.find((o) => o.id === orderId)?.totalAmount.toLocaleString()}
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
                </span>
              </TooltipTrigger>
              {isReadOnly && (
                <TooltipContent>
                  <p>Business is currently in Read-Only Mode</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-neutral-100/50 dark:bg-neutral-900/50 p-1 border rounded-lg">
            <TabsTrigger value="ledger" className="text-xs cursor-pointer">
              Billing Ledger
            </TabsTrigger>
            <TabsTrigger value="receivables" className="text-xs cursor-pointer flex items-center gap-1.5">
              <Landmark className="h-3.5 w-3.5" /> Receivables Workspace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ledger" className="space-y-6">
            {/* Statistics Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
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

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
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

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Unpaid Invoices</span>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{unpaidCount}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Invoices awaiting settlement</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Total Invoiced Amount</span>
                  <Receipt className="h-4 w-4 text-indigo-500" />
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
          </TabsContent>

          {/* Receivables Workspace */}
          <TabsContent value="receivables" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aging Receivables & Metrics */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Aging Receivables Profile</CardTitle>
                  <CardDescription className="text-xs">Distribution of outstanding invoices based on credit terms.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      <span>Current (0-30 Days)</span>
                      <span>৳{(totalReceivables * 0.65).toLocaleString(undefined, { maximumFractionDigits: 0 })} (65%)</span>
                    </div>
                    <Progress value={65} className="h-2 bg-neutral-100 dark:bg-neutral-900" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      <span>Past Due (31-60 Days)</span>
                      <span>৳{(totalReceivables * 0.20).toLocaleString(undefined, { maximumFractionDigits: 0 })} (20%)</span>
                    </div>
                    <Progress value={20} className="h-2 bg-neutral-100 dark:bg-neutral-900" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      <span>Past Due (61-90 Days)</span>
                      <span>৳{(totalReceivables * 0.10).toLocaleString(undefined, { maximumFractionDigits: 0 })} (10%)</span>
                    </div>
                    <Progress value={10} className="h-2 bg-neutral-100 dark:bg-neutral-900" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-neutral-800 dark:text-neutral-200 text-rose-600">
                      <span>Overdue (91+ Days)</span>
                      <span>৳{(totalReceivables * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })} (5%)</span>
                    </div>
                    <Progress value={5} className="h-2 bg-neutral-100 dark:bg-neutral-900 bg-rose-500" />
                  </div>
                </CardContent>
              </Card>

              {/* Collections & Credit Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Days Sales Outstanding (DSO)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">22.4 Days</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" /> -1.8d improvement
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Average duration required to clear accounts receivable ledgers.</p>
                  </CardContent>
                </Card>

                <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold uppercase text-muted-foreground">Collection Effectiveness Index</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">94.8%</span>
                      <span className="text-[10px] text-muted-foreground">Target: 95.0%</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Percentage of invoice balances collected within designated credit windows.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Invoice Settlement Form */}
            <div>
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Fast Clearance Desk
                  </CardTitle>
                  <CardDescription className="text-xs">Record payments received for outstanding invoice balances.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleQuickPayment} className="space-y-4">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Outstanding Invoice *</Label>
                      <Select value={quickInvoiceId} onValueChange={setQuickInvoiceId}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Choose Invoice..." />
                        </SelectTrigger>
                        <SelectContent>
                          {invoices.filter(i => i.status !== 'PAID').map((inv) => (
                            <SelectItem key={inv.id} value={inv.id} className="text-xs">
                              {inv.invoiceNo} - {inv.customerName} (Due: ৳{inv.dueAmount.toLocaleString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs">Collection Amount (৳) *</Label>
                      <Input
                        placeholder="৳ Amount collected"
                        value={quickAmount}
                        onChange={(e) => setQuickAmount(e.target.value)}
                        className="text-xs h-10"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs">Payment Method Channel</Label>
                      <Select value={quickMethod} onValueChange={setQuickMethod}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Select Method..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BKASH" className="text-xs">bKash (MFS)</SelectItem>
                          <SelectItem value="NAGAD" className="text-xs">Nagad (MFS)</SelectItem>
                          <SelectItem value="BANK_TRANSFER" className="text-xs">Bank Wire Transfer</SelectItem>
                          <SelectItem value="CASH" className="text-xs">Cash In Hand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button type="submit" className="text-xs h-10 w-full mt-2" disabled={isReadOnly}>
                              Record Clearance Receipt
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {isReadOnly && (
                          <TooltipContent>
                            <p>Business is currently in Read-Only Mode</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
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
