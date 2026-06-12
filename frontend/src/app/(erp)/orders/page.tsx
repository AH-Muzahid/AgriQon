'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import {
  useOrders,
  useCreateOrder,
  useCancelOrder,
  useCreatePayment,
  useSuppliers,
  useWarehouses,
} from '@/services/query/hooks';

import { OrderFormValues, PaymentCollectionFormValues } from './schemas/order.schema';
import { getOrderColumns } from './components/order-columns';
import { OrderFormDialog } from './components/order-form-dialog';
import { OrderDetailsSheet } from './components/order-details-sheet';
import { PaymentCollectionDialog } from './components/payment-collection-dialog';
import { SalesDashboard } from './components/sales-dashboard';
import { useQueryClient } from '@tanstack/react-query';

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: warehouses = [] } = useWarehouses();
  const { data: suppliers = [] } = useSuppliers();

  const createOrderMutation = useCreateOrder();
  const cancelOrderMutation = useCancelOrder();
  const collectPaymentMutation = useCreatePayment();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [selectedDueAmount, setSelectedDueAmount] = useState(0);

  // Filter orders
  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedOrder = orders.find((o: any) => o.id === selectedOrderId) || null;

  const handleCreateOrder = async (values: OrderFormValues) => {
    try {
      await createOrderMutation.mutateAsync({
        customerId: values.customerId,
        items: values.items.map((i) => ({
          sku: i.itemId,
          qty: i.quantity,
        })),
      });
      setCreateDialogOpen(false);
      toast.success('Sales Order registered successfully');
      queryClient.invalidateQueries({ queryKey: ['analytics', 'sales-dashboard'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to register sales order');
    }
  };

  const handleCancelOrder = async (id: string) => {
    try {
      await cancelOrderMutation.mutateAsync(id);
      toast.success('Sales Order cancelled successfully');
      setSheetOpen(false);
      queryClient.invalidateQueries({ queryKey: ['analytics', 'sales-dashboard'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel sales order');
    }
  };

  const handleCollectPayment = async (values: PaymentCollectionFormValues) => {
    try {
      let mappedMethod: 'Cash' | 'MFS (bKash/Nagad)' | 'Bank Transfer' | 'Credit Card' = 'Cash';
      if (values.method === 'BKASH' || values.method === 'NAGAD') {
        mappedMethod = 'MFS (bKash/Nagad)';
      } else if (values.method === 'BANK_TRANSFER') {
        mappedMethod = 'Bank Transfer';
      } else if (values.method === 'CARD') {
        mappedMethod = 'Credit Card';
      }

      await collectPaymentMutation.mutateAsync({
        invoiceNo: selectedInvoiceId,
        amount: values.amount,
        method: mappedMethod,
      });

      setPaymentDialogOpen(false);
      toast.success('Remittance payment collected & cleared');
      queryClient.invalidateQueries({ queryKey: ['analytics', 'sales-dashboard'] });
    } catch (err: any) {
      toast.error(err.message || 'Failed to collect payment');
    }
  };

  const columns = getOrderColumns({
    onViewDetails: (order) => {
      setSelectedOrderId(order.id);
      setSheetOpen(true);
    },
  });

  return (
    <PageShell
      title="Sales Orders"
      description="Track client operations, dispatch fulfillment statuses, and log customer invoice closures."
      actions={
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Sales Order
        </Button>
      }
    >
      {/* Sales Analytics Dashboard KPIs */}
      <SalesDashboard />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-4">
        <div className="flex flex-1 max-w-sm gap-2">
          <Input placeholder="Search SO number, customer name..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-background" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
            <SelectItem value="PROCESSING">PROCESSING</SelectItem>
            <SelectItem value="DELIVERED">DELIVERED</SelectItem>
            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={filteredOrders} isLoading={ordersLoading} />

      {/* Order Dialogs & Sheets */}
      <OrderFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSubmit={handleCreateOrder} warehouses={warehouses} isPending={createOrderMutation.isPending} />
      
      <OrderDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        order={selectedOrder}
        onCancel={handleCancelOrder}
        onCollectPaymentClick={(invoiceId, dueAmount) => {
          setSelectedInvoiceId(invoiceId);
          setSelectedDueAmount(dueAmount);
          setPaymentDialogOpen(true);
        }}
      />

      <PaymentCollectionDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onSubmit={handleCollectPayment}
        invoiceNumber={selectedOrder?.invoice?.invoiceNumber || ''}
        dueAmount={selectedDueAmount}
        isPending={collectPaymentMutation.isPending}
      />
    </PageShell>
  );
}
