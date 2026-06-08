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
import { Users, Coins, TrendingUp, Handshake, Eye, Mail, Phone, MapPin, Plus, Edit3, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@/services/query/hooks';
import { CustomerContract } from '@/types/contracts/customer.contract';

export default function CustomersPage() {
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerContract | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Form states
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [editCustomer, setEditCustomer] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate statistics from query data
  const activeCustomersCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalReceivables = customers.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0);
  const totalSalesRevenue = customers.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);
  const totalPurchasesCount = customers.reduce((acc, curr) => acc + (curr.purchasesCount || 0), 0);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) {
      toast.error('Customer Name is required');
      return;
    }

    try {
      await createCustomerMutation.mutateAsync({
        name: newCustomer.name,
        email: newCustomer.email || '',
        phone: newCustomer.phone || '',
        address: newCustomer.address || '',
      });

      setCreateDialogOpen(false);
      toast.success(`Customer ${newCustomer.name} created successfully`);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create customer');
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer.name) {
      toast.error('Customer Name is required');
      return;
    }

    try {
      await updateCustomerMutation.mutateAsync({
        id: editCustomer.id,
        input: {
          name: editCustomer.name,
          email: editCustomer.email,
          phone: editCustomer.phone,
          address: editCustomer.address,
        },
      });

      setEditDialogOpen(false);
      toast.success(`Customer ${editCustomer.name} updated successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update customer');
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer ${name}?`)) return;

    try {
      await deleteCustomerMutation.mutateAsync(id);
      toast.success(`Customer ${name} deleted successfully`);
      if (selectedCustomer?.id === id) {
        setSheetOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete customer');
    }
  };

  const columns = [
    {
      header: 'Customer ID',
      accessor: (row: CustomerContract) => (
        <span className="font-mono text-xs text-muted-foreground">{row.id.slice(0, 8).toUpperCase()}</span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: (row: CustomerContract) => (
        <div className="grid gap-0.5">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.email || 'No email'}</span>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (row: CustomerContract) => (
        <span className="text-muted-foreground text-xs">{row.phone || 'N/A'}</span>
      ),
    },
    {
      header: 'Orders Logged',
      accessor: (row: CustomerContract) => (
        <span className="font-semibold">{row.purchasesCount || 0} orders</span>
      ),
    },
    {
      header: 'Total Purchases',
      accessor: (row: CustomerContract) => (
        <span className="font-mono font-medium">৳{(row.totalSpent || 0).toLocaleString()}</span>
      ),
    },
    {
      header: 'Outstanding Balance',
      accessor: (row: CustomerContract) => (
        <span className={`font-mono font-bold ${row.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          ৳{(row.dueAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: CustomerContract) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: CustomerContract) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 cursor-pointer text-xs"
            onClick={() => {
              setSelectedCustomer(row);
              setSheetOpen(true);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 cursor-pointer text-xs text-blue-600 hover:text-blue-700"
            onClick={() => {
              setEditCustomer({
                id: row.id,
                name: row.name,
                email: row.email,
                phone: row.phone,
                address: row.address,
              });
              setEditDialogOpen(true);
            }}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 cursor-pointer text-xs text-destructive hover:text-destructive"
            onClick={() => handleDeleteCustomer(row.id, row.name)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      ),
      className: "text-right"
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Customers Directory"
        description="Customer profile records, order summaries, outstanding balances, and activity trackers."
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                Register Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register Customer</DialogTitle>
                <DialogDescription>Create a new wholesale or enterprise buyer profile in the system.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer} className="grid gap-4 py-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Dhaka Agros Ltd."
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="e.g. contact@dhakaagro.com"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="e.g. +88017XXXXXXXX"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="address">Billing Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g. 12/A Tejgaon, Dhaka"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createCustomerMutation.isPending}>
                    {createCustomerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Customer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Customer Statistics Card Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Active Customers</span>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCustomersCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Contract accounts active</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Receivables (Dues)</span>
              <Coins className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">৳{totalReceivables.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Outstanding unpaid balances</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Sales Generated</span>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">৳{totalSalesRevenue.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Lifetime wholesale revenue</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Transactions</span>
              <Handshake className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchasesCount}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Cumulative invoices generated</p>
            </CardContent>
          </Card>
        </div>

        {/* Customer Table */}
        <DataTable
          data={filteredCustomers}
          columns={columns}
          searchPlaceholder="Search customers by name, phone, email..."
          searchValue={search}
          onSearchChange={setSearch}
          emptyStateTitle="No Customers Found"
          emptyStateDescription="Register customer accounts to log sales orders, invoice due balances, and payments."
          isLoading={customersLoading}
        />
      </PageShell>

      {/* Edit Customer Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Modify profile info for customer: <span className="font-bold">{editCustomer.name}</span></DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCustomer} className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name">Customer Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g. Dhaka Agros Ltd."
                value={editCustomer.name}
                onChange={(e) => setEditCustomer({ ...editCustomer, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="e.g. contact@dhakaagro.com"
                  value={editCustomer.email}
                  onChange={(e) => setEditCustomer({ ...editCustomer, email: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  placeholder="e.g. +88017XXXXXXXX"
                  value={editCustomer.phone}
                  onChange={(e) => setEditCustomer({ ...editCustomer, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-address">Billing Address</Label>
              <Input
                id="edit-address"
                placeholder="e.g. 12/A Tejgaon, Dhaka"
                value={editCustomer.address}
                onChange={(e) => setEditCustomer({ ...editCustomer, address: e.target.value })}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateCustomerMutation.isPending}>
                {updateCustomerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Customer Profile Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedCustomer && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedCustomer.id.slice(0, 8).toUpperCase()}
                  </span>
                  <StatusBadge status={selectedCustomer.status} />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">{selectedCustomer.name}</SheetTitle>
                <SheetDescription>Wholesale client profile file.</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6 text-sm">
                {/* Contact Card */}
                <div className="border bg-slate-50 p-4 rounded-xl space-y-2 border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{selectedCustomer.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{selectedCustomer.phone || 'No phone provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{selectedCustomer.address || 'No address provided'}</span>
                  </div>
                </div>

                {/* Account stats */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Total Spent</span>
                    <span className="font-mono font-bold text-lg text-emerald-600">
                      ৳{(selectedCustomer.totalSpent || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Outstanding Due</span>
                    <span className={`font-mono font-bold text-lg ${(selectedCustomer.dueAmount || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ৳{(selectedCustomer.dueAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                {selectedCustomer.timeline && selectedCustomer.timeline.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block mb-3">Activity Timeline</span>
                    <div className="relative border-l pl-4 ml-2 space-y-4 text-xs">
                      {selectedCustomer.timeline.map((event, index) => (
                        <div key={index} className="relative">
                          <span className="absolute -left-[21px] top-0.5 size-2.5 rounded-full border bg-white border-primary" />
                          <div className="grid gap-0.5">
                            <span className="text-[10px] text-muted-foreground">{event.date}</span>
                            <span className="font-semibold text-slate-700">{event.event}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </React.Fragment>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
