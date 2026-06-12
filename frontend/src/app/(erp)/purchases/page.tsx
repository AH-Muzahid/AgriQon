'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  Warehouse,
  Eye,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  usePurchases,
  useCreatePurchase,
  useReceivePurchase,
  useCancelPurchase,
  usePayPurchase,
  useSuppliers,
  useProducts,
  useWarehouses,
} from '@/services/query/hooks';
import { PurchaseOrder } from '@/types/contracts/purchase.contract';
import { useAuthStore } from '@/store/auth-store';

const purchaseItemSchema = z.object({
  itemId: z.string().min(1, 'Product selection is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitCost: z.number().min(0.01, 'Unit cost must be greater than 0'),
});

const purchaseSchema = z.object({
  supplierId: z.string().min(1, 'Supplier selection is required'),
  items: z.array(purchaseItemSchema).min(1, 'At least one line item is required'),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

export default function PurchasesPage() {
  const { data: purchases = [], isLoading: purchasesLoading } = usePurchases();
  const { data: suppliers = [] } = useSuppliers();
  const { data: products = [] } = useProducts();
  const { data: warehouses = [] } = useWarehouses();
  const { hasPermission } = useAuthStore();

  const createPurchaseMutation = useCreatePurchase();
  const receivePurchaseMutation = useReceivePurchase();
  const cancelPurchaseMutation = useCancelPurchase();
  const payPurchaseMutation = usePayPurchase();

  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [receivingWarehouseId, setReceivingWarehouseId] = useState('');

  // Autocomplete search inside dialog for supplier selection
  const [supplierSearchText, setSupplierSearchText] = useState('');

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: '',
      items: [{ itemId: '', quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  });

  // Calculate live total based on form values
  const formValues = form.watch();
  const previewTotal = formValues.items?.reduce((sum, item) => {
    return sum + (Number(item.quantity || 0) * Number(item.unitCost || 0));
  }, 0) || 0;

  // Filtered purchases
  const filteredPurchases = purchases.filter((po) => {
    const matchesSearch = po.id.toLowerCase().includes(search.toLowerCase()) ||
      (po.supplier?.name && po.supplier.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesSupplier = supplierFilter === 'ALL' || po.supplierId === supplierFilter;
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;

    return matchesSearch && matchesSupplier && matchesStatus;
  });

  // Get active purchase detail from the list (keeps sheet data reactive after updates)
  const selectedPurchase = purchases.find((p) => p.id === selectedPurchaseId) || null;

  // KPI calculations
  const pendingPOs = purchases.filter((po) => po.status === 'PENDING').length;
  const receivedThisMonth = purchases.filter((po) => {
    if (po.status !== 'RECEIVED') return false;
    const date = new Date(po.updatedAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const outstandingPayables = purchases
    .filter((po) => po.status === 'RECEIVED')
    .reduce((sum, po) => sum + Number(po.total || 0), 0);

  const supplierCount = suppliers.length;

  const handleCreatePO = async (values: PurchaseFormValues) => {
    try {
      const payload = {
        supplierId: values.supplierId,
        items: values.items.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          unitCost: item.unitCost,
        })),
        total: previewTotal,
      };

      await createPurchaseMutation.mutateAsync(payload);
      setCreateDialogOpen(false);
      toast.success('Purchase Order created successfully');
      form.reset({
        supplierId: '',
        items: [{ itemId: '', quantity: 1, unitCost: 0 }],
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to create Purchase Order');
    }
  };

  const handleReceivePO = async () => {
    if (!selectedPurchaseId || !receivingWarehouseId) return;

    try {
      await receivePurchaseMutation.mutateAsync({
        id: selectedPurchaseId,
        warehouseId: receivingWarehouseId,
      });
      setReceiveDialogOpen(false);
      setReceivingWarehouseId('');
      toast.success('Purchase Order marked as RECEIVED in full');
    } catch (err: any) {
      toast.error(err.message || 'Failed to receive purchase order');
    }
  };

  const handleCancelPO = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this Purchase Order?')) return;

    try {
      await cancelPurchaseMutation.mutateAsync(id);
      toast.success('Purchase Order cancelled successfully');
      setSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel Purchase Order');
    }
  };

  const handleRecordPayment = async (id: string) => {
    try {
      await payPurchaseMutation.mutateAsync(id);
      toast.success('Supplier payment recorded & bookkeeping event emitted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to record supplier payment');
    }
  };

  const filteredSuppliersForPO = suppliers.filter((s) =>
    s.name.toLowerCase().includes(supplierSearchText.toLowerCase())
  );

  const columns = [
    {
      header: 'PO Number',
      accessor: (row: PurchaseOrder) => (
        <span className="font-semibold text-foreground font-mono text-xs block">
          PO-{row.id.substring(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Supplier',
      accessor: (row: PurchaseOrder) => (
        <span className="font-medium text-foreground">{row.supplier?.name || 'Unknown Vendor'}</span>
      ),
    },
    {
      header: 'Total Cost',
      accessor: (row: PurchaseOrder) => (
        <span className="font-semibold text-foreground">
          ${Number(row.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: PurchaseOrder) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Date',
      accessor: (row: PurchaseOrder) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: PurchaseOrder) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedPurchaseId(row.id); setSheetOpen(true); }} title="View Details">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageShell
      title="Procurement & Purchase Orders"
      description="Replenish warehouse stock, track vendor invoices, and manage incoming inventory cost recalculations."
      actions={
        <Button onClick={() => {
          form.reset({
            supplierId: '',
            items: [{ itemId: '', quantity: 1, unitCost: 0 }],
          });
          setSupplierSearchText('');
          setCreateDialogOpen(true);
        }} className="gap-2">
          <Plus className="h-4 w-4" /> Issue Purchase Order
        </Button>
      }
    >
      {/* KPI Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-muted/60 hover:border-primary/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending POs</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingPOs}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting receipt confirmation</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-muted/60 hover:border-primary/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Received This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{receivedThisMonth}</div>
            <p className="text-xs text-muted-foreground mt-1">POs successfully stocked</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-muted/60 hover:border-primary/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Outstanding Payables</CardTitle>
            <DollarSign className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${outstandingPayables.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">From received, pending settlement</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-muted/60 hover:border-primary/20 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suppliers Count</CardTitle>
            <TrendingDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{supplierCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Procurement supply points</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-4">
        <div className="flex flex-1 max-w-sm gap-2">
          <Input
            placeholder="Search POs by code, vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Suppliers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Suppliers</SelectItem>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="RECEIVED">RECEIVED</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredPurchases}
        isLoading={purchasesLoading}
      />

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Purchase Order</DialogTitle>
            <DialogDescription>
              Create a purchase contract with a vendor. Goods will only be stocked once marked as RECEIVED.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreatePO)} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Select Supplier *</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    placeholder="Type supplier name to filter..."
                    value={supplierSearchText}
                    onChange={(e) => setSupplierSearchText(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }: any) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose registered supplier..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredSuppliersForPO.length === 0 ? (
                              <div className="p-2 text-xs text-muted-foreground italic">No suppliers found</div>
                            ) : (
                              filteredSuppliersForPO.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Line Items Array */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="text-sm font-semibold">Line Items (SKUs & Quantities)</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: '', quantity: 1, unitCost: 1 })}>
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3.5">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2.5 items-end bg-muted/20 p-2.5 rounded-lg border border-dashed border-muted">
                      <div className="flex-1 min-w-[200px]">
                        <Label className="text-xs">Product SKU *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.itemId`}
                          render={({ field: selectField }: any) => (
                            <FormItem>
                              <Select onValueChange={selectField.onChange} value={selectField.value}>
                                <FormControl>
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select SKU..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {products.map((p) => (
                                    <SelectItem key={p.id || p.sku} value={p.id || p.sku}>{p.name} ({p.sku})</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-[100px]">
                        <Label className="text-xs">Quantity *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field: inputField }: any) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  className="h-9"
                                  {...inputField}
                                  onChange={(e) => inputField.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-[120px]">
                        <Label className="text-xs">Unit Cost *</Label>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitCost`}
                          render={({ field: costField }: any) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  className="h-9"
                                  {...costField}
                                  onChange={(e) => costField.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="button" variant="ghost" size="icon" className="text-destructive h-9" disabled={fields.length === 1} onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview Total */}
              <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/20">
                <span className="text-xs text-muted-foreground font-medium uppercase">Estimated PO Total (Pre-Calculation)</span>
                <span className="text-lg font-bold text-primary">
                  ${previewTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createPurchaseMutation.isPending}>
                  {createPurchaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Submit Purchase Order
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* PO Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedPurchase && (
            <>
              <SheetHeader className="mb-4">
                <div className="flex justify-between items-center pr-6">
                  <SheetTitle className="text-xl font-bold">PO-{selectedPurchase.id.substring(0, 8).toUpperCase()}</SheetTitle>
                  <StatusBadge status={selectedPurchase.status} />
                </div>
                <SheetDescription>Issued on {new Date(selectedPurchase.createdAt).toLocaleDateString()}</SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Supplier Detail Card */}
                <Card className="border border-muted/50 bg-muted/10">
                  <CardContent className="pt-4 space-y-1">
                    <div className="text-xs text-muted-foreground uppercase font-semibold">Supplier Details</div>
                    <div className="font-bold text-foreground">{selectedPurchase.supplier?.name}</div>
                    {selectedPurchase.supplier?.contact && <div className="text-sm text-muted-foreground">Rep: {selectedPurchase.supplier.contact}</div>}
                    {selectedPurchase.supplier?.phone && <div className="text-sm text-muted-foreground">Ph: {selectedPurchase.supplier.phone}</div>}
                  </CardContent>
                </Card>

                {/* Items Summary */}
                <div className="space-y-2">
                  <span className="text-xs uppercase font-semibold text-muted-foreground">Procured Items</span>
                  <div className="space-y-2">
                    {selectedPurchase.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-card p-3 rounded-lg border border-muted/50">
                        <div>
                          <span className="font-medium text-foreground block">{item.item?.name || 'Unknown SKU'}</span>
                          <span className="text-xs text-muted-foreground">Qty: {item.quantity} units @ ${Number(item.unitCost).toFixed(2)}</span>
                        </div>
                        <span className="font-bold text-foreground">
                          ${(item.quantity * Number(item.unitCost)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Costs Recap */}
                <div className="flex justify-between items-center border-t border-b py-3 font-semibold text-foreground">
                  <span>Grand Total Cost (WAC recapped)</span>
                  <span className="text-xl font-bold text-primary">
                    ${Number(selectedPurchase.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Action Controls based on status */}
                {selectedPurchase.status === 'PENDING' && (
                  <div className="space-y-2 pt-2">
                    {/* Warehouse receive authorization checks */}
                    {hasPermission('ORG_MANAGE') || hasPermission('INVENTORY_ADJUST') ? (
                      <Button className="w-full gap-2" onClick={() => setReceiveDialogOpen(true)}>
                        <Warehouse className="h-4 w-4" /> Receive Items in Full
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground italic justify-center">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        Warehouse permission required to stock items
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 text-destructive hover:bg-destructive/10" onClick={() => handleCancelPO(selectedPurchase.id)}>
                        Cancel Purchase Order
                      </Button>
                    </div>
                  </div>
                )}

                {selectedPurchase.status === 'RECEIVED' && (
                  <div className="space-y-2 pt-2">
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <div>
                        <strong>Cost Recap Recalculated:</strong> Items have been added to inventory. The Weighted Average Cost (WAC) has been updated on the backend.
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full gap-2 border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" onClick={() => handleRecordPayment(selectedPurchase.id)}>
                      <DollarSign className="h-4 w-4" /> Record Supplier Payment
                    </Button>
                  </div>
                )}

                {selectedPurchase.status === 'CANCELLED' && (
                  <div className="text-center p-3 bg-muted/30 border border-dashed rounded-lg text-sm text-muted-foreground italic">
                    This purchase order has been cancelled and voided.
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Receive Order Confirmation Dialog (Full Receipt Only) */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Full Inventory Receipt</DialogTitle>
            <DialogDescription>
              Marking this order as RECEIVED will book the items into the selected warehouse. This action recalculates item costs on the backend and is irreversible.
            </DialogDescription>
          </DialogHeader>

          {selectedPurchase && (
            <div className="space-y-4 pt-2">
              <div className="text-sm bg-muted/50 p-2.5 rounded-lg space-y-1">
                <div className="text-xs text-muted-foreground">Order Summary:</div>
                <div className="font-semibold">{selectedPurchase.supplier?.name}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  PO-{selectedPurchase.id.substring(0, 8).toUpperCase()} - Total: ${Number(selectedPurchase.total).toFixed(2)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouseSelect">Select Destination Warehouse *</Label>
                <Select value={receivingWarehouseId} onValueChange={setReceivingWarehouseId}>
                  <SelectTrigger id="warehouseSelect">
                    <SelectValue placeholder="Choose warehouse for intake..." />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name} ({w.address || 'No address'})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setReceiveDialogOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleReceivePO}
                  disabled={!receivingWarehouseId || receivePurchaseMutation.isPending}
                  className="gap-2"
                >
                  {receivePurchaseMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Warehouse className="h-4 w-4" />}
                  Confirm Intake
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
