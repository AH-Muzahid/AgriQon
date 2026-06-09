'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { usePayments, usePayment } from '@/services/query/hooks';
import {
  Eye,
  RefreshCw,
  FileText,
  DollarSign,
  Calendar,
  Layers,
  ArrowRight,
  Shield,
  Clock,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [invoiceId, setInvoiceId] = useState<string>('');
  
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filters mapping
  const activeFilters = {
    page,
    limit,
    ...(status !== 'ALL' && { status }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(customerId && { customerId }),
    ...(invoiceId && { invoiceId }),
  };

  const { data, isLoading, refetch } = usePayments(activeFilters);
  const { data: detail, isLoading: detailLoading } = usePayment(selectedPaymentId || '');

  const payments = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleRowClick = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setSheetOpen(true);
  };

  const handleClearFilters = () => {
    setStatus('ALL');
    setStartDate('');
    setEndDate('');
    setCustomerId('');
    setInvoiceId('');
    setPage(1);
    toast.success('Filters cleared');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value).replace('BDT', '৳');
  };

  const columns = [
    {
      header: 'Voucher ID',
      accessor: (row: any) => (
        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {row.paymentNo}
        </span>
      ),
    },
    {
      header: 'Invoice Reference',
      accessor: (row: any) => (
        <span className="font-mono text-xs text-neutral-500 font-semibold">
          {row.invoiceNo}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: (row: any) => (
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
          {row.customerName}
        </span>
      ),
    },
    {
      header: 'Timestamp',
      accessor: (row: any) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.date).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: 'Settlement Method',
      accessor: (row: any) => (
        <Badge variant="outline" className="text-[10px] font-semibold bg-neutral-50/50 dark:bg-neutral-900/50">
          {row.method}
        </Badge>
      ),
    },
    {
      header: 'Cleared Amount',
      accessor: (row: any) => (
        <span className="font-black text-emerald-600 text-xs">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Gateway Status',
      accessor: (row: any) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs cursor-pointer"
          onClick={() => handleRowClick(row.id)}
        >
          <Eye className="h-3 w-3" />
          Inspect
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Payments Ledger"
        description="Verify incoming transaction logs, MFS settlements, and ledger reconciliations."
        actions={
          <Button onClick={() => refetch()} className="gap-1.5 font-semibold text-xs cursor-pointer shadow-sm">
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Ledger
          </Button>
        }
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Query Filters HUD */}
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white/70 dark:bg-neutral-950/35 backdrop-blur-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xs font-bold uppercase text-neutral-400">Search & Filter Controls</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 text-xs">
              {/* Status Filter */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-neutral-600">Settlement Status</Label>
                <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="Choose status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="SUCCESS" className="text-xs">SUCCESS</SelectItem>
                    <SelectItem value="PENDING" className="text-xs">PENDING</SelectItem>
                    <SelectItem value="FAILED" className="text-xs">FAILED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-neutral-600">Start Period</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    className="pl-8 h-9 text-xs bg-background"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-neutral-600">End Period</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    className="pl-8 h-9 text-xs bg-background"
                  />
                </div>
              </div>

              {/* Customer ID Filter */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-neutral-600">Customer UUID</Label>
                <Input
                  placeholder="Filter by customer ID"
                  value={customerId}
                  onChange={(e) => { setCustomerId(e.target.value); setPage(1); }}
                  className="h-9 text-xs bg-background"
                />
              </div>

              {/* Invoice ID Filter */}
              <div className="space-y-1.5">
                <Label className="font-semibold text-neutral-600">Invoice UUID</Label>
                <Input
                  placeholder="Filter by invoice ID"
                  value={invoiceId}
                  onChange={(e) => { setInvoiceId(e.target.value); setPage(1); }}
                  className="h-9 text-xs bg-background"
                />
              </div>

              {/* Clear Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="h-9 w-full text-xs font-bold"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ledger Table */}
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white/70 dark:bg-neutral-950/35 backdrop-blur-md">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span className="text-xs font-semibold">Synchronizing transactions ledger...</span>
                </div>
              ) : (
                <React.Fragment>
                  <DataTable
                    data={payments}
                    columns={columns}
                    emptyStateTitle="No Payments Logged"
                    emptyStateDescription="No transactions found matching the specified ledger queries."
                  />

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t p-4 bg-muted/5 text-xs font-semibold text-slate-500">
                      <span>
                        Showing Page {page} of {totalPages} ({total} entries logged)
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === 1}
                          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                          className="text-xs"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page === totalPages}
                          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                          className="text-xs"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )}
            </CardContent>
          </Card>
        </div>
      </PageShell>

      {/* Inspect Drawer/Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {detailLoading ? (
            <div className="flex h-full items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-xs font-semibold">Fetching transaction records...</span>
            </div>
          ) : detail ? (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-50 text-[10px] font-bold">
                    Voucher: {detail.payment.paymentNo}
                  </Badge>
                  <StatusBadge status={detail.payment.status} />
                </div>
                <SheetTitle className="text-lg font-black mt-2">Inspect Payment Voucher</SheetTitle>
                <SheetDescription className="text-xs">
                  Voucher record UUID: {detail.payment.id}
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6 text-xs font-semibold text-slate-600">
                {/* Payment Overview */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase">Settlement Amount</span>
                    <span className="text-lg font-black text-emerald-600 block">
                      {formatCurrency(detail.payment.amount)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase">Payment Gateway</span>
                    <span className="text-sm font-bold text-neutral-800 block">
                      {detail.payment.method}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase">Timestamp</span>
                    <span className="font-semibold block text-neutral-700">
                      {new Date(detail.payment.date).toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase">Transaction ID</span>
                    <span className="font-mono text-neutral-700 block bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] select-all w-fit">
                      {detail.order?.payments?.[0]?.transactionId || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Invoice Metadata */}
                {detail.invoice && (
                  <div className="border-b pb-4 space-y-3">
                    <span className="text-[10px] text-muted-foreground uppercase block">Associated Invoice</span>
                    <div className="border rounded-xl p-3 bg-neutral-50/50 dark:bg-neutral-900/10 space-y-2">
                      <div className="flex justify-between">
                        <span>Invoice No:</span>
                        <span className="font-mono font-bold text-neutral-800">{detail.invoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Invoice Date:</span>
                        <span>{new Date(detail.invoice.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Due:</span>
                        <span className="font-bold">{formatCurrency(Number(detail.invoice.dueAmount))}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                {detail.order?.customer && (
                  <div className="border-b pb-4 space-y-2">
                    <span className="text-[10px] text-muted-foreground uppercase block">Customer Profile</span>
                    <div className="flex items-center gap-2 text-neutral-800">
                      <div className="p-1.5 bg-neutral-100 rounded-full">
                        <User className="h-4 w-4 text-neutral-500" />
                      </div>
                      <div className="grid">
                        <span className="font-bold">{detail.order.customer.name}</span>
                        <span className="text-[10px] text-muted-foreground">{detail.order.customer.email || 'No email registered'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Trail Log */}
                <div className="space-y-3">
                  <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5 text-neutral-400" />
                    Immutable Audit Trail
                  </span>
                  
                  {detail.auditLogs && detail.auditLogs.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {detail.auditLogs.map((log: any) => (
                        <div key={log.id} className="border p-2 rounded-lg bg-neutral-50/50 dark:bg-neutral-900/10 space-y-1.5">
                          <div className="flex justify-between text-[10px]">
                            <span className="font-bold text-neutral-800">{log.action}</span>
                            <span className="text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between text-[9px] text-muted-foreground">
                            <span>Operator: {log.user}</span>
                            <span className="font-mono">IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground p-3 border border-dashed rounded-lg bg-neutral-50/30">
                      <Clock className="h-4 w-4" />
                      No system operations logged against this voucher yet.
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground">Payment details not found.</div>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
