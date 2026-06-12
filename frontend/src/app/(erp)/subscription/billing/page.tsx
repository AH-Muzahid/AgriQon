'use client';

import React, { useState } from 'react';
import { useSubscriptionStatus, useSubscriptionBilling } from '@/hooks/use-subscription';
import { subscriptionService } from '@/services/api/subscription/subscription.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle,
  Receipt,
  CreditCard,
  History,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SubscriptionBillingPage() {
  const {
    status,
    isReadOnly,
    isTrial,
    expiresAt,
    isLoading: isStatusLoading,
  } = useSubscriptionStatus();

  const {
    data: billingData,
    isLoading: isBillingLoading,
    refetch: refetchBilling,
  } = useSubscriptionBilling();

  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isRenewalOpen, setIsRenewalOpen] = useState(false);
  const [submittingUpgrade, setSubmittingUpgrade] = useState(false);
  const [submittingRenewal, setSubmittingRenewal] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState('PRO');

  const handleRequestUpgrade = async () => {
    setSubmittingUpgrade(true);
    try {
      await subscriptionService.createUpgradeRequest(selectedPlanCode);
      toast.success(`Upgrade request to ${selectedPlanCode} plan submitted successfully`);
      setIsUpgradeOpen(false);
      refetchBilling();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit upgrade request');
    } finally {
      setSubmittingUpgrade(false);
    }
  };

  const handleRequestRenewal = async () => {
    setSubmittingRenewal(true);
    try {
      const planCode = selectedPlanCode || 'PRO'; // Default fallback
      await subscriptionService.createRenewalRequest(planCode);
      toast.success('Renewal request submitted successfully');
      setIsRenewalOpen(false);
      refetchBilling();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit renewal request');
    } finally {
      setSubmittingRenewal(false);
    }
  };

  const getInvoiceStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'PENDING':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'PAID':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Paid</Badge>;
      case 'VOID':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Void</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">{statusStr}</Badge>;
    }
  };

  const getPaymentStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'PENDING':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>;
      case 'SUCCESS':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Success</Badge>;
      case 'FAILED':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">{statusStr}</Badge>;
    }
  };

  const getRequestStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'PENDING':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse">Pending</Badge>;
      case 'APPROVED':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">{statusStr}</Badge>;
    }
  };

  const formatCurrency = (amount: number | string, currency: string = 'BDT') => {
    const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numeric);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRefresh = () => {
    refetchBilling();
  };

  if (isStatusLoading || isBillingLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading billing records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Top Banner and Navigation */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="text-sm text-muted-foreground">
            View invoicing history, record payments, and manage subscription requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          {/* Upgrade Request Dialog */}
          <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-medium shadow">
                Request Upgrade <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Plan Upgrade</DialogTitle>
                <DialogDescription>
                  Submit a request to change your current tier. Our administrators will review the request and generate an invoice.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block">Select Target Tier</span>
                
                <div 
                  onClick={() => setSelectedPlanCode('PRO')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlanCode === 'PRO' 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-foreground">Professional (PRO) Plan</span>
                      <span className="text-xs text-muted-foreground">For growing agribusinesses needing advanced capabilities.</span>
                    </div>
                    {selectedPlanCode === 'PRO' && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
                  </div>
                </div>

                <div 
                  onClick={() => setSelectedPlanCode('STANDARD')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlanCode === 'STANDARD' 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-foreground">Standard Plan</span>
                      <span className="text-xs text-muted-foreground">Ideal for smaller operations focusing on stock control.</span>
                    </div>
                    {selectedPlanCode === 'STANDARD' && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpgradeOpen(false)}>Cancel</Button>
                <Button onClick={handleRequestUpgrade} disabled={submittingUpgrade}>
                  {submittingUpgrade ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : null} Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Renewal Request Dialog */}
          <Dialog open={isRenewalOpen} onOpenChange={setIsRenewalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Request Renewal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Subscription Renewal</DialogTitle>
                <DialogDescription>
                  Renew your current active plan. This will alert administrative billing to prepare the next invoice cycles.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-muted/40 p-4 rounded-xl border text-sm my-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Plan:</span>
                  <span className="font-semibold text-foreground">{isTrial ? 'TRIAL Plan' : 'Active Plan'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline">{status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expiration Date:</span>
                  <span className="font-semibold text-foreground">
                    {expiresAt ? formatDate(expiresAt) : 'N/A'}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRenewalOpen(false)}>Cancel</Button>
                <Button onClick={handleRequestRenewal} disabled={submittingRenewal}>
                  {submittingRenewal ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : null} Submit Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Billing Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Invoices List */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg flex items-center gap-1.5"><Receipt className="h-5 w-5 text-primary" /> Subscription Invoices</CardTitle>
              <CardDescription>View billing statements issued for subscription periods.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {billingData?.invoices && billingData.invoices.length > 0 ? (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Date Issued</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium text-foreground flex items-center gap-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {inv.invoiceNumber}
                        </TableCell>
                        <TableCell>{formatCurrency(inv.amount, inv.currency)}</TableCell>
                        <TableCell>{getInvoiceStatusBadge(inv.status)}</TableCell>
                        <TableCell>{formatDate(inv.dueDate)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDate(inv.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 border border-dashed rounded-xl">
                <Receipt className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="font-semibold text-sm">No Invoices Issued</p>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  You are currently on a free trial. Once invoices are generated by administrators, they will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Requests Status Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-1.5"><History className="h-5 w-5 text-primary" /> Subscription Requests</CardTitle>
            <CardDescription>Upgrade and renewal requests submitted to administration</CardDescription>
          </CardHeader>
          <CardContent>
            {billingData?.changeRequests && billingData.changeRequests.length > 0 ? (
              <div className="space-y-4">
                {billingData.changeRequests.map((req) => (
                  <div key={req.id} className="p-3 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        <Badge variant={req.type === 'UPGRADE' ? 'default' : 'secondary'}>
                          {req.type}
                        </Badge>
                      </span>
                      {getRequestStatusBadge(req.status)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>Plan Target: <strong>{req.requestedPlanCode}</strong></span>
                      <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {formatDate(req.requestedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 border border-dashed rounded-xl">
                <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="font-semibold text-sm">No Pending Requests</p>
                <p className="text-xs text-muted-foreground max-w-xs mt-1">
                  Use the Upgrade or Renewal buttons at the top to request plan adjustments.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Row Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Payments List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-1.5"><CreditCard className="h-5 w-5 text-primary" /> Recorded Payments</CardTitle>
            <CardDescription>History of transaction credits recorded on invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            {billingData?.payments && billingData.payments.length > 0 ? (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Transaction Ref</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.payments.map((pay) => (
                      <TableRow key={pay.id}>
                        <TableCell className="font-medium text-foreground">{formatCurrency(pay.amount)}</TableCell>
                        <TableCell className="text-xs">{pay.method}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">
                          {pay.transactionReference || 'N/A'}
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(pay.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{formatDate(pay.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 border border-dashed rounded-xl">
                <DollarSign className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="font-semibold text-sm">No Recorded Payments</p>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  When payments are manually credited or automated payment gateway completes verification, they will be logged here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Administration/Sandbox Context Info Card */}
        <Card className="bg-gradient-to-br from-primary/5 via-primary/0 to-primary/10 border-primary/20 flex flex-col justify-between">
          <CardHeader>
            <div className="p-2 bg-amber-500/10 rounded-lg w-fit text-amber-500 mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CardTitle>Evaluation sandbox</CardTitle>
            <CardDescription>
              AgriQon Billing is operating in a manual evaluation mode.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-3">
            <p>
              No real-money payment gateways are integrated in this sandbox. Invoices and request fulfillment are mock instances managed by system operators.
            </p>
            <p>
              In S9 (next phase), Stripe API, SSLCommerz, and local mobile money services will automate invoice status settlements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
