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
import { Eye, Plus, CreditCard, Banknote, ShieldCheck, History } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_PAYMENTS, MOCK_INVOICES, MockPayment } from '@/lib/mock-erp-data';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<MockPayment[]>(MOCK_PAYMENTS);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<MockPayment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [invoiceNo, setInvoiceNo] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'Bank Transfer' | 'MFS (bKash/Nagad)' | 'Cash' | 'Credit Card'>('Bank Transfer');

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.paymentNo.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  // Calculate statistics
  const totalVolume = payments.reduce((sum, p) => sum + p.amount, 0);
  const bkashVolume = payments.filter((p) => p.method.includes('MFS')).reduce((sum, p) => sum + p.amount, 0);
  const bankVolume = payments.filter((p) => p.method === 'Bank Transfer').reduce((sum, p) => sum + p.amount, 0);
  const cashVolume = payments.filter((p) => p.method === 'Cash').reduce((sum, p) => sum + p.amount, 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNo) {
      toast.error('Please select an invoice number');
      return;
    }
    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    const invoice = MOCK_INVOICES.find((i) => i.invoiceNo === invoiceNo);
    if (!invoice) return;

    const newPaymentNo = `PMT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newPayment: MockPayment = {
      id: `pay_${Math.floor(Math.random() * 10000)}`,
      paymentNo: newPaymentNo,
      invoiceNo,
      date: new Date().toISOString(),
      customerName: invoice.customerName,
      amount: payAmt,
      method,
      status: 'SUCCESS', // Automatically verified in mockup
    };

    setPayments([newPayment, ...payments]);
    setCreateDialogOpen(false);
    toast.success(`Payment voucher ${newPaymentNo} logged and applied!`);

    // Reset Form
    setInvoiceNo('');
    setAmount('');
    setMethod('Bank Transfer');
  };

  const columns = [
    {
      header: 'Voucher No',
      accessor: (row: MockPayment) => (
        <span className="font-mono text-xs font-semibold">{row.paymentNo}</span>
      ),
    },
    {
      header: 'Invoice Reference',
      accessor: (row: MockPayment) => (
        <span className="font-mono text-xs text-muted-foreground">{row.invoiceNo}</span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: (row: MockPayment) => (
        <span className="font-semibold text-foreground">{row.customerName}</span>
      ),
    },
    {
      header: 'Transaction Date',
      accessor: (row: MockPayment) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.date).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: 'Method',
      accessor: (row: MockPayment) => (
        <span className="inline-flex items-center gap-1.5 bg-slate-100 border text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
          {row.method}
        </span>
      ),
    },
    {
      header: 'Amount Received',
      accessor: (row: MockPayment) => (
        <span className="font-mono font-bold text-emerald-600">
          ৳{row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Verification',
      accessor: (row: MockPayment) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: MockPayment) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedPayment(row);
            setSheetOpen(true);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          Details
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Payments Ledger"
        description="Record bank transfers, mobile financial service (MFS) tokens, and credit collections."
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Record Payment Entry</DialogTitle>
                <DialogDescription>
                  Enter transaction details to clear outstanding receivables.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleRecordPayment} className="grid gap-4 py-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="invoice">Invoice Reference *</Label>
                  <Select
                    value={invoiceNo}
                    onValueChange={(val) => {
                      setInvoiceNo(val);
                      const inv = MOCK_INVOICES.find((i) => i.invoiceNo === val);
                      if (inv) setAmount(inv.dueAmount.toString());
                    }}
                  >
                    <SelectTrigger className="w-full bg-background text-xs">
                      <SelectValue placeholder="Select outstanding invoice..." />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_INVOICES.map((i) => (
                        <SelectItem key={i.invoiceNo} value={i.invoiceNo} className="text-xs">
                          {i.invoiceNo} - {i.customerName} (Due: ৳{i.dueAmount.toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="amount">Payment Amount (৳) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="text-xs bg-background"
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="method">Payment Method *</Label>
                  <Select
                    value={method}
                    onValueChange={(val) =>
                      setMethod(val as 'Bank Transfer' | 'MFS (bKash/Nagad)' | 'Cash' | 'Credit Card')
                    }
                  >
                    <SelectTrigger className="w-full bg-background text-xs">
                      <SelectValue placeholder="Choose payment mode..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                      <SelectItem value="MFS (bKash/Nagad)" className="text-xs">MFS (bKash/Nagad)</SelectItem>
                      <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                      <SelectItem value="Credit Card" className="text-xs">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!invoiceNo || !amount}>
                    Post Transaction
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Payment Metrics Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Volume Logged</span>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ৳{totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Cleared transactions sum</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Bank Clearings</span>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ৳{bankVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Direct wire clearance volume</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">MFS (Mobile Cash)</span>
              <Banknote className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-600">
                ৳{bkashVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">bKash and Nagad collections</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Cash Handed Over</span>
              <History className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-700">
                ৳{cashVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Counter collections logged</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Data Table */}
        <DataTable
          data={filteredPayments}
          columns={columns}
          searchPlaceholder="Search payments by No, Invoice Ref, or Customer..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={
            <div className="flex items-center gap-2">
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-48 h-10 bg-background text-xs">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Methods</SelectItem>
                  <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                  <SelectItem value="MFS (bKash/Nagad)" className="text-xs">MFS (bKash/Nagad)</SelectItem>
                  <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                  <SelectItem value="Credit Card" className="text-xs">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
          emptyStateTitle="No Payments Recorded"
          emptyStateDescription="Log new payments to clear customer balances and balance the general cash ledger."
        />
      </PageShell>

      {/* Payment details sheet drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedPayment && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedPayment.paymentNo}
                  </span>
                  <StatusBadge status="SUCCESS" />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">Payment Receipt</SheetTitle>
                <span className="text-xs text-muted-foreground">
                  Applied to Invoice: <span className="font-mono font-semibold">{selectedPayment.invoiceNo}</span>
                </span>
              </SheetHeader>

              <div className="py-6 space-y-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Customer Account</span>
                  <div className="font-semibold text-slate-700">{selectedPayment.customerName}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Transaction Date</span>
                    <span className="font-medium text-xs">
                      {new Date(selectedPayment.date).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Payment Method</span>
                    <span className="inline-flex mt-1 items-center bg-slate-100 text-slate-700 border px-2 py-0.5 rounded text-[10px] font-semibold">
                      {selectedPayment.method}
                    </span>
                  </div>
                </div>

                <div className="border bg-emerald-50/50 p-4 rounded-xl border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase block">Amount Cleared</span>
                    <span className="text-xs text-emerald-600 font-medium">Applied fully to balance</span>
                  </div>
                  <span className="font-mono text-xl font-bold text-emerald-700">
                    ৳{selectedPayment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => {
                      toast.info(`Mock Print receipt trigger for ${selectedPayment.paymentNo}`);
                    }}
                  >
                    Print Verification Slip
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
