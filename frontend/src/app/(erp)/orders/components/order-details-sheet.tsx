'use client';

import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { Coins, AlertTriangle, FileText, Ban } from 'lucide-react';

interface OrderDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  onCancel: (id: string) => Promise<void>;
  onCollectPaymentClick: (invoiceId: string, dueAmount: number) => void;
}

export function OrderDetailsSheet({
  open,
  onOpenChange,
  order,
  onCancel,
  onCollectPaymentClick,
}: OrderDetailsSheetProps) {
  if (!order) return null;

  const invoice = order.invoice;
  const isUnpaid = invoice && Number(invoice.dueAmount) > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-4">
          <div className="flex justify-between items-center pr-6">
            <SheetTitle className="text-xl font-bold">SO-{order.id.substring(0, 8).toUpperCase()}</SheetTitle>
            <StatusBadge status={order.status} />
          </div>
          <SheetDescription>Operational sales order log details</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Customer / Client Detail Card */}
          <Card className="border border-muted/50 bg-muted/10">
            <CardContent className="pt-4 space-y-1 text-sm">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Client details</div>
              <div className="font-bold text-foreground">{order.customer?.name || 'Walk-in Client'}</div>
              {order.customer?.phone && <div className="text-muted-foreground">Ph: {order.customer.phone}</div>}
              {order.customer?.email && <div className="text-muted-foreground">Email: {order.customer.email}</div>}
            </CardContent>
          </Card>

          {/* Items Recap */}
          <div className="space-y-2">
            <span className="text-xs uppercase font-semibold text-muted-foreground">Ordered SKUs</span>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center bg-card p-3 rounded-lg border border-muted/50 text-xs">
                  <div>
                    <span className="font-medium text-foreground block">{item.item?.title || 'Product SKU'}</span>
                    <span className="text-muted-foreground">Qty: {item.quantity} units @ ${Number(item.unitPrice).toFixed(2)}</span>
                  </div>
                  <span className="font-bold text-foreground">
                    ${(item.quantity * Number(item.unitPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Recap */}
          <div className="border-t border-b py-3 flex justify-between items-center font-semibold text-foreground text-sm">
            <span>Grand Total Sale</span>
            <span className="text-lg font-bold text-primary">
              ${Number(order.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Invoice tracking details */}
          {invoice && (
            <Card className="border border-muted/50 bg-card">
              <CardContent className="pt-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Invoice #</span>
                  <span className="font-mono font-bold">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invoiced</span>
                  <span className="font-semibold">${Number(invoice.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Collected</span>
                  <span className="font-semibold text-emerald-600">${Number(invoice.paidAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Balance Due</span>
                  <span className={Number(invoice.dueAmount) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    ${Number(invoice.dueAmount).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action triggers */}
          <div className="space-y-2 pt-2">
            {isUnpaid && (
              <Button
                className="w-full gap-2"
                onClick={() => onCollectPaymentClick(invoice.id, Number(invoice.dueAmount))}
              >
                <Coins className="h-4 w-4" /> Collect Payment
              </Button>
            )}

            {order.status === 'PENDING' && (
              <Button variant="outline" className="w-full gap-2 text-destructive hover:bg-destructive/10" onClick={() => onCancel(order.id)}>
                <Ban className="h-4 w-4" /> Cancel Order
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
export default OrderDetailsSheet;
