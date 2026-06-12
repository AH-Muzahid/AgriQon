'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Coins, TrendingUp, Handshake, Plus } from 'lucide-react';
import { toast } from 'sonner';

import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/services/query/hooks';
import { CustomerContract } from '@/types/contracts/customer.contract';
import { CustomerFormValues } from './schemas/customer.schema';
import { getCustomerColumns } from './components/customer-columns';
import { CustomerFormDialog } from './components/customer-form-dialog';
import { CustomerDetailsSheet } from './components/customer-details-sheet';
import { KPIStatCard } from '@/components/business/KPIStatCard';

export default function CustomersPage() {
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerContract | null>(null);
  
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Filter customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const activeCustomersCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalReceivables = customers.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0);
  const totalSalesRevenue = customers.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);
  const totalPurchasesCount = customers.reduce((acc, curr) => acc + (curr.purchasesCount || 0), 0);

  const handleCreateCustomer = async (values: CustomerFormValues) => {
    try {
      await createCustomerMutation.mutateAsync({
        name: values.name,
        email: values.email || '',
        phone: values.phone || '',
        address: values.address || '',
      });
      setCreateDialogOpen(false);
      toast.success(`Customer "${values.name}" registered successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to register customer');
    }
  };

  const handleUpdateCustomer = async (values: CustomerFormValues) => {
    if (!selectedCustomer) return;
    try {
      await updateCustomerMutation.mutateAsync({
        id: selectedCustomer.id,
        input: {
          name: values.name,
          email: values.email || '',
          phone: values.phone || '',
          address: values.address || '',
        },
      });
      setEditDialogOpen(false);
      setSelectedCustomer(null);
      toast.success(`Customer "${values.name}" updated successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
      try {
        await deleteCustomerMutation.mutateAsync(id);
        toast.success(`Customer "${name}" deleted successfully`);
        setSheetOpen(false);
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete customer');
      }
    }
  };

  const columns = getCustomerColumns({
    onViewDetails: (customer) => {
      setSelectedCustomer(customer);
      setSheetOpen(true);
    },
    onEdit: (customer) => {
      setSelectedCustomer(customer);
      setEditDialogOpen(true);
    },
    onDelete: handleDeleteCustomer,
  });

  return (
    <PageShell
      title="Customers"
      description="Manage corporate accounts, track customer ledger events, and review outstanding invoice aging balances."
      actions={
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Register Customer
        </Button>
      }
    >
      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <KPIStatCard title="Active Clients" value={activeCustomersCount} description="Active trading accounts" icon={<Users className="h-4 w-4" />} />
        <KPIStatCard title="Total Receivables" value={`$${totalReceivables.toLocaleString()}`} description="Client outstanding balance" icon={<Coins className="h-4 w-4 text-rose-500" />} />
        <KPIStatCard title="Accumulated Sales" value={`$${totalSalesRevenue.toLocaleString()}`} description="Net invoice revenue" icon={<TrendingUp className="h-4 w-4 text-emerald-500" />} />
        <KPIStatCard title="Invoiced Orders" value={totalPurchasesCount} description="Transactions logged" icon={<Handshake className="h-4 w-4" />} />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-4">
        <div className="flex flex-1 max-w-sm gap-2">
          <Input placeholder="Search name, phone, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-background" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="ACTIVE">ACTIVE</SelectItem>
            <SelectItem value="INACTIVE">INACTIVE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={filteredCustomers} isLoading={customersLoading} />

      {/* Forms & Drawers */}
      <CustomerFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSubmit={handleCreateCustomer} isPending={createCustomerMutation.isPending} />
      <CustomerFormDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} onSubmit={handleUpdateCustomer} initialData={selectedCustomer} isPending={updateCustomerMutation.isPending} />
      <CustomerDetailsSheet open={sheetOpen} onOpenChange={setSheetOpen} customer={selectedCustomer} onEdit={(cust) => { setSheetOpen(false); setSelectedCustomer(cust); setEditDialogOpen(true); }} onDelete={handleDeleteCustomer} />
    </PageShell>
  );
}
