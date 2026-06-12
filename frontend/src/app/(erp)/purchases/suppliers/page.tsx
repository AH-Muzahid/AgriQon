'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Mail, Phone, MapPin, Plus, Edit3, Trash2, Loader2, ArrowLeft, Eye, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
} from '@/services/query/hooks';
import { Supplier } from '@/types/contracts/supplier.contract';

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier Name is required'),
  contact: z.string().optional(),
  email: z.string().email('Invalid email address').or(z.literal('')),
  phone: z.string().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading: suppliersLoading } = useSuppliers();
  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const deleteSupplierMutation = useDeleteSupplier();

  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contact: '',
      email: '',
      phone: '',
    },
  });

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter((s) => {
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.toLowerCase().includes(search.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const onSubmitCreate = async (values: SupplierFormValues) => {
    try {
      await createSupplierMutation.mutateAsync({
        name: values.name,
        contact: values.contact || '',
        email: values.email || '',
        phone: values.phone || '',
      });

      setCreateDialogOpen(false);
      toast.success(`Supplier "${values.name}" registered successfully`);
      form.reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register supplier');
    }
  };

  const onSubmitUpdate = async (values: SupplierFormValues) => {
    if (!editingId) return;
    try {
      await updateSupplierMutation.mutateAsync({
        id: editingId,
        input: {
          name: values.name,
          contact: values.contact || '',
          email: values.email || '',
          phone: values.phone || '',
        },
      });

      setEditDialogOpen(false);
      setEditingId(null);
      toast.success(`Supplier "${values.name}" updated successfully`);
      form.reset();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update supplier');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete supplier "${name}"?`)) {
      try {
        await deleteSupplierMutation.mutateAsync(id);
        toast.success(`Supplier "${name}" deleted`);
        if (selectedSupplier?.id === id) {
          setSheetOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete supplier');
      }
    }
  };

  const startEdit = (supplier: Supplier) => {
    setEditingId(supplier.id);
    form.reset({
      name: supplier.name,
      contact: supplier.contact || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
    });
    setEditDialogOpen(true);
  };

  const viewDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSheetOpen(true);
  };

  const columns = [
    {
      header: 'Supplier Name',
      accessor: (row: Supplier) => (
        <div>
          <span className="font-semibold text-foreground block">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.contact || 'No contact person'}</span>
        </div>
      ),
    },
    {
      header: 'Email / Phone',
      accessor: (row: Supplier) => (
        <div className="flex flex-col text-sm">
          {row.email && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              {row.email}
            </span>
          )}
          {row.phone && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              {row.phone}
            </span>
          )}
          {!row.email && !row.phone && <span className="text-muted-foreground italic text-xs">No contact info</span>}
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: Supplier) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => viewDetails(row)} title="View Detail">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => startEdit(row)} title="Edit Supplier">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(row.id, row.name)} title="Delete Supplier">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Suppliers"
      description="Manage vendor profiles, wholesale contact information, and purchase logs."
      actions={
        <Button onClick={() => {
          form.reset({ name: '', contact: '', email: '', phone: '' });
          setCreateDialogOpen(true);
        }} className="gap-2">
          <Plus className="h-4 w-4" /> Register Supplier
        </Button>
      }
    >
      {/* KPI Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-muted/60 transition-all hover:border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Suppliers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sourcing partners enrolled</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-4">
        <div className="flex flex-1 max-w-sm gap-2">
          <Input
            placeholder="Search suppliers by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredSuppliers}
        isLoading={suppliersLoading}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to procure items, replenish stock, and track costs.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Seeds Ltd." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+8801700000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createSupplierMutation.isPending}>
                  {createSupplierMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Register
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) setEditingId(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier details and contact preferences.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4 pt-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Seeds Ltd." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@acme.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+8801700000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={updateSupplierMutation.isPending}>
                  {updateSupplierMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Supplier Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedSupplier && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle className="text-xl font-bold">{selectedSupplier.name}</SheetTitle>
                <SheetDescription>Supplier Profile & Procurement History</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Contact Information Card */}
                <Card className="border border-muted/50 bg-muted/10">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-2.5 text-sm">
                      <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Contact Representative</span>
                        <span className="text-muted-foreground">{selectedSupplier.contact || 'Not defined'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm">
                      <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Email Address</span>
                        <span className="text-muted-foreground">{selectedSupplier.email || 'No email registered'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 text-sm">
                      <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground block">Phone Number</span>
                        <span className="text-muted-foreground">{selectedSupplier.phone || 'No phone registered'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operations */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => { setSheetOpen(false); startEdit(selectedSupplier); }}>
                    <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1 gap-1" onClick={() => handleDelete(selectedSupplier.id, selectedSupplier.name)}>
                    <Trash2 className="h-3.5 w-3.5" /> Remove Partner
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </PageShell>
  );
}
