'use client';

import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Mail, Phone, MapPin, Eye, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useCustomerLedger } from '@/services/query/hooks';
import { CustomerContract } from '@/types/contracts/customer.contract';
import { StatusBadge } from '@/components/status-badge';
import { useRouter } from 'next/navigation';

interface CustomerDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerContract | null;
  onEdit: (customer: CustomerContract) => void;
  onDelete: (id: string, name: string) => void;
}

export function CustomerDetailsSheet({
  open,
  onOpenChange,
  customer,
  onEdit,
  onDelete,
}: CustomerDetailsSheetProps) {
  const router = useRouter();
  const { data: ledger = [], isLoading: ledgerLoading } = useCustomerLedger(customer?.id || '');

  if (!customer) return null;

  const handleViewOrders = () => {
    onOpenChange(false);
    router.push(`/orders?customer=${customer.id}`);
  };

  const handleViewInvoices = () => {
    onOpenChange(false);
    router.push(`/invoices?customer=${customer.id}`);
  };

  const isOverdue = (dueDateStr?: string) => {
    if (!dueDateStr) return false;
    return new Date(dueDateStr) < new Date();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center pr-6">
            <SheetTitle className="text-xl font-bold">{customer.name}</SheetTitle>
            <StatusBadge status={customer.status} />
          </div>
          <SheetDescription>Dossier & Transactional Activity Stream</SheetDescription>
        </SheetHeader>

        {/* Contact Info Card */}
        <Card className="border border-muted/50 bg-muted/10 mb-6">
          <CardContent className="pt-4 space-y-2.5">
            <div className="flex items-start gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block">Email</span>
                <span className="text-muted-foreground">{customer.email || 'None'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block">Phone</span>
                <span className="text-muted-foreground">{customer.phone || 'None'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block">Billing Address</span>
                <span className="text-muted-foreground">{customer.address || 'None'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Jump Links */}
        <div className="flex gap-2 mb-6">
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleViewOrders}>
            View Orders <ArrowRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={handleViewInvoices}>
            View Invoices <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Tabs for CRM & Finance */}
        <Tabs defaultValue="ledger" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="ledger">Ledger</TabsTrigger>
            <TabsTrigger value="receivables">Due</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
          </TabsList>

          {/* Tab 1: Ledger (Read-only transactional audit trail) */}
          <TabsContent value="ledger" className="space-y-3">
            {ledgerLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : ledger.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground italic p-4">No ledger items recorded.</p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {ledger.map((item: any) => {
                  const isCredit = item.amount < 0;
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border bg-card text-xs">
                      <div>
                        <span className={`font-semibold block ${isCredit ? 'text-emerald-600' : 'text-foreground'}`}>
                          {item.type} - {item.reference}
                        </span>
                        <span className="text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block">
                          {isCredit ? '' : '+'}${Math.abs(item.amount).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{item.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Receivables & Due balances */}
          <TabsContent value="receivables" className="space-y-3">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 flex justify-between items-center">
              <span className="text-xs uppercase font-semibold text-muted-foreground">Total Receivables</span>
              <span className={`text-lg font-bold ${customer.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${Number(customer.dueAmount || 0).toFixed(2)}
              </span>
            </div>

            {customer.dueAmount > 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Outstanding balance detected.</strong> Please check corresponding customer invoices to register payments.
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Sales History */}
          <TabsContent value="history" className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-lg border bg-muted/10">
                <span className="text-xs text-muted-foreground block uppercase">Sales Volume</span>
                <span className="text-lg font-bold">${Number(customer.totalSpent || 0).toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-lg border bg-muted/10">
                <span className="text-xs text-muted-foreground block uppercase">Orders Placed</span>
                <span className="text-lg font-bold">{customer.purchasesCount || 0}</span>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: CRM placeholders */}
          <TabsContent value="crm" className="space-y-3 text-center py-6 text-sm text-muted-foreground">
            <p className="italic">Notes & activity streams are reserved for CRM updates in Phase 4.</p>
          </TabsContent>
        </Tabs>

        {/* Action Controls */}
        <div className="flex gap-2 pt-6 mt-6 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(customer)}>
            Modify Profile
          </Button>
          <Button variant="destructive" size="sm" className="flex-1" onClick={() => onDelete(customer.id, customer.name)}>
            Remove Customer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
