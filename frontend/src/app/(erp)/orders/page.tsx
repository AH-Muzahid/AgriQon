'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Plus,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Trash2,
  User,
  Package,
  FileText,
  CreditCard,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useOrders,
  useCustomers,
  useProducts,
  useCreateOrder,
  useCreateInvoice,
  useCreatePayment,
} from '@/services/query/hooks';
import { OrderContract } from '@/types/contracts/order.contract';
import { useSubscriptionStatus } from '@/hooks/use-subscription';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function OrdersPage() {
  const { isReadOnly } = useSubscriptionStatus();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: customers = [], isLoading: customersLoading } = useCustomers();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  const createOrderMutation = useCreateOrder();
  const createInvoiceMutation = useCreateInvoice();
  const createPaymentMutation = useCreatePayment();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderContract | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Tab switching
  const [activeTab, setActiveTab] = useState('ledger');

  // Sales Workflow Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [wizardOrderItems, setWizardOrderItems] = useState<{ sku: string; name: string; qty: number; price: number }[]>([]);
  const [tempSku, setTempSku] = useState('');
  const [tempQty, setTempQty] = useState('1');
  const [invoiceTerms, setInvoiceTerms] = useState('DUE_ON_RECEIPT');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Temporary drafted entities for step-by-step display
  const [draftedOrder, setDraftedOrder] = useState<any>(null);
  const [draftedInvoice, setDraftedInvoice] = useState<any>(null);

  // Calculate order stats
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED').length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCustomerName = (id: string) => {
    return customers.find((c) => c.id === id)?.name || 'Walk-in Client';
  };

  const handleAddTempItem = () => {
    if (!tempSku) {
      toast.error('Select a product SKU');
      return;
    }
    const qty = parseInt(tempQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Invalid quantity');
      return;
    }
    const prod = products.find((p) => p.sku === tempSku);
    if (!prod) return;

    const existingIdx = wizardOrderItems.findIndex((item) => item.sku === tempSku);
    if (existingIdx > -1) {
      const updated = [...wizardOrderItems];
      updated[existingIdx].qty += qty;
      setWizardOrderItems(updated);
    } else {
      setWizardOrderItems([
        ...wizardOrderItems,
        { sku: prod.sku, name: prod.name, qty, price: prod.sellingPrice },
      ]);
    }
    setTempSku('');
    setTempQty('1');
    toast.success(`Added ${prod.name}`);
  };

  const handleRemoveTempItem = (index: number) => {
    const updated = [...wizardOrderItems];
    updated.splice(index, 1);
    setWizardOrderItems(updated);
  };

  const handleNextStep = async () => {
    if (wizardStep === 1) {
      if (!selectedCustomerId) {
        toast.error('Select a customer to continue');
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (wizardOrderItems.length === 0) {
        toast.error('Add at least one line item to the order');
        return;
      }
      try {
        const orderRes = await createOrderMutation.mutateAsync({
          customerId: selectedCustomerId,
          items: wizardOrderItems.map(i => ({ sku: i.sku, qty: i.qty })),
        });
        setDraftedOrder(orderRes);
        setWizardStep(3);
      } catch (err) {
        toast.error('Failed to draft sales order');
      }
    } else if (wizardStep === 3) {
      try {
        const invoiceRes = await createInvoiceMutation.mutateAsync({
          orderId: draftedOrder.id,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        setDraftedInvoice(invoiceRes);
        setWizardStep(4);
      } catch (err) {
        toast.error('Failed to create invoice');
      }
    } else if (wizardStep === 4) {
      try {
        let formattedMethod: 'Bank Transfer' | 'MFS (bKash/Nagad)' | 'Cash' | 'Credit Card' = 'Cash';
        if (paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') formattedMethod = 'MFS (bKash/Nagad)';
        else if (paymentMethod === 'BANK_TRANSFER') formattedMethod = 'Bank Transfer';

        await createPaymentMutation.mutateAsync({
          invoiceNo: draftedInvoice.invoiceNo,
          method: formattedMethod,
          amount: draftedOrder.totalAmount,
        });
        setWizardStep(5);
        toast.success('Sales workflow completed successfully!');
      } catch (err) {
        toast.error('Failed to record payment');
      }
    }
  };

  const handlePrevStep = () => {
    if (wizardStep > 1) {
      setWizardStep(prev => prev - 1);
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setSelectedCustomerId('');
    setWizardOrderItems([]);
    setDraftedOrder(null);
    setDraftedInvoice(null);
  };

  const totalWizardAmount = wizardOrderItems.reduce((sum, item) => sum + item.qty * item.price, 0);

  const columns = [
    {
      header: 'Order ID',
      accessor: (row: OrderContract) => <span className="font-mono text-xs font-semibold">{row.id}</span>,
    },
    {
      header: 'Date Logged',
      accessor: (row: OrderContract) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: (row: OrderContract) => <span className="font-semibold text-foreground">{row.customerName}</span>,
    },
    {
      header: 'Item Count',
      accessor: (row: OrderContract) => (
        <span className="text-muted-foreground text-xs">
          {row.items.reduce((acc, curr) => acc + curr.qty, 0)} units ({row.items.length} lines)
        </span>
      ),
    },
    {
      header: 'Total Value',
      accessor: (row: OrderContract) => (
        <span className="font-mono font-semibold">৳{row.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: OrderContract) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: (row: OrderContract) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedOrder(row);
            setSheetOpen(true);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Sales Orders & Operations"
        description="Streamline the sales journey from customer selection to payment collection."
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-neutral-100/50 dark:bg-neutral-900/50 p-1 border rounded-lg">
            <TabsTrigger value="ledger" className="text-xs cursor-pointer">
              Sales Ledger
            </TabsTrigger>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <TabsTrigger
                      value="wizard"
                      className="text-xs cursor-pointer flex items-center gap-1.5"
                      disabled={isReadOnly}
                    >
                      <ShoppingCart className="h-3 w-3" /> Guided Sales Workspace {isReadOnly && '🔒'}
                    </TabsTrigger>
                  </span>
                </TooltipTrigger>
                {isReadOnly && (
                  <TooltipContent>
                    <p>Business is currently in Read-Only Mode</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </TabsList>

          <TabsContent value="ledger" className="space-y-6">
            {/* Sales Statistics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Approvals</span>
                  <Clock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Orders requiring validation</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">In Sourcing / Processing</span>
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{processingCount}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Confirmed orders in queue</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Delivered Orders</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{deliveredCount}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Successful handovers</p>
                </CardContent>
              </Card>

              <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Cumulative Value</span>
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  <p className="text-[10px] text-muted-foreground mt-1">Total revenue booked</p>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <DataTable
              data={filteredOrders}
              columns={columns}
              searchPlaceholder="Search sales orders by ID or customer..."
              searchValue={search}
              onSearchChange={setSearch}
              filters={
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 h-10 bg-background text-xs">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                      <SelectItem value="PENDING" className="text-xs">Pending</SelectItem>
                      <SelectItem value="CONFIRMED" className="text-xs">Confirmed</SelectItem>
                      <SelectItem value="PROCESSING" className="text-xs">Processing</SelectItem>
                      <SelectItem value="DELIVERED" className="text-xs">Delivered</SelectItem>
                      <SelectItem value="CANCELLED" className="text-xs">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
              emptyStateTitle="No Sales Orders"
              emptyStateDescription="New sales orders registered in the system will be displayed here."
            />
          </TabsContent>

          {/* Guided Sales Workspace */}
          <TabsContent value="wizard">
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-lg bg-white/70 dark:bg-black/35 backdrop-blur-md">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold">Guided Sales Workspace</CardTitle>
                    <CardDescription>Step-by-step wizard to register order, issue invoice, and log payment receipt.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetWizard} className="text-xs">
                    Reset Workspace
                  </Button>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-5 gap-2 mt-6">
                  {[
                    { step: 1, label: 'Customer', icon: User },
                    { step: 2, label: 'Add Items', icon: Package },
                    { step: 3, label: 'Invoice', icon: FileText },
                    { step: 4, label: 'Payment', icon: CreditCard },
                    { step: 5, label: 'Fulfillment', icon: Check },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isActive = wizardStep === s.step;
                    const isCompleted = wizardStep > s.step;
                    return (
                      <div
                        key={s.step}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center transition-all ${
                          isActive
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm scale-102'
                            : isCompleted
                            ? 'bg-emerald-500/5 border-emerald-500/35 text-emerald-600'
                            : 'bg-neutral-50/50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 text-muted-foreground opacity-60'
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        <span className="text-[10px] hidden md:inline">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {/* STEP 1: Select Customer */}
                {wizardStep === 1 && (
                  <div className="space-y-4 max-w-lg mx-auto py-4">
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Step 1: Assign Client Account</h3>
                    <p className="text-xs text-muted-foreground">Select an existing account from the wholesale customer profiles database.</p>
                    <div className="space-y-2">
                      <Label className="text-xs">Select Customer Profile *</Label>
                      <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Choose customer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">
                              {c.name} ({c.phone}) - Due: ৳{c.dueAmount.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* STEP 2: Add Line Items */}
                {wizardStep === 2 && (
                  <div className="space-y-4 max-w-2xl mx-auto py-2">
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      Step 2: Add Inventory Line Items for {getCustomerName(selectedCustomerId)}
                    </h3>
                    <div className="grid md:grid-cols-5 gap-3 items-end bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-lg border">
                      <div className="md:col-span-3 grid gap-1.5">
                        <Label className="text-xs">Select Product SKU</Label>
                        <Select value={tempSku} onValueChange={setTempSku}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Choose SKU..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products.filter(p => p.status === 'ACTIVE').map((p) => (
                              <SelectItem key={p.sku} value={p.sku} className="text-xs">
                                {p.sku} - {p.name} (৳{p.sellingPrice})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={tempQty}
                          onChange={(e) => setTempQty(e.target.value)}
                          className="text-xs h-10"
                        />
                      </div>
                      <Button onClick={handleAddTempItem} className="text-xs h-10 w-full">
                        Add Item
                      </Button>
                    </div>

                    {/* Temp Items Table */}
                    {wizardOrderItems.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden bg-background">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-neutral-50 dark:bg-neutral-900 border-b">
                            <tr>
                              <th className="p-3">SKU / Item</th>
                              <th className="p-3 text-right">Quantity</th>
                              <th className="p-3 text-right">Unit Price</th>
                              <th className="p-3 text-right">Total Price</th>
                              <th className="p-3"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {wizardOrderItems.map((item, idx) => (
                              <tr key={idx}>
                                <td className="p-3">
                                  <span className="font-mono text-[10px] text-muted-foreground block">{item.sku}</span>
                                  <span className="font-semibold">{item.name}</span>
                                </td>
                                <td className="p-3 text-right">{item.qty} units</td>
                                <td className="p-3 text-right font-mono">৳{item.price.toFixed(2)}</td>
                                <td className="p-3 text-right font-mono font-bold">৳{(item.qty * item.price).toFixed(2)}</td>
                                <td className="p-3 text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveTempItem(idx)}
                                    className="h-7 w-7 text-rose-500 hover:bg-rose-500/10 rounded"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-neutral-50/50 dark:bg-neutral-900/50 font-bold">
                              <td colSpan={3} className="p-3 text-right text-xs">Subtotal Amount:</td>
                              <td className="p-3 text-right font-mono text-indigo-600 dark:text-indigo-400">
                                ৳{totalWizardAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg bg-neutral-50/30">
                        No line items added yet. Search and select products above to compile the order.
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: Generate Invoice */}
                {wizardStep === 3 && draftedOrder && (
                  <div className="space-y-4 max-w-lg mx-auto py-4">
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Step 3: Define Invoice Credit Terms</h3>
                    <p className="text-xs text-muted-foreground">
                      An order was generated: <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">{draftedOrder.id}</span> for{' '}
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">৳{draftedOrder.totalAmount.toLocaleString()}</span>. Choose payment terms for billing.
                    </p>

                    <div className="space-y-2">
                      <Label className="text-xs">Invoice Due Term</Label>
                      <Select value={invoiceTerms} onValueChange={setInvoiceTerms}>
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Select terms..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DUE_ON_RECEIPT" className="text-xs">Due on Receipt</SelectItem>
                          <SelectItem value="NET_15" className="text-xs">Net 15 Days</SelectItem>
                          <SelectItem value="NET_30" className="text-xs">Net 30 Days</SelectItem>
                          <SelectItem value="NET_45" className="text-xs">Net 45 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* STEP 4: Record Payment */}
                {wizardStep === 4 && draftedInvoice && (
                  <div className="space-y-4 max-w-lg mx-auto py-4">
                    <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Step 4: Record Initial Payment Collection</h3>
                    <p className="text-xs text-muted-foreground">
                      Invoice <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">{draftedInvoice.id}</span> generated. Record a transaction to mark the invoice as cleared.
                    </p>

                    <div className="space-y-2">
                      <Label className="text-xs">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger className="w-full text-xs">
                          <SelectValue placeholder="Select method..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH" className="text-xs">Cash In Hand</SelectItem>
                          <SelectItem value="BANK_TRANSFER" className="text-xs">Bank Wire Transfer</SelectItem>
                          <SelectItem value="BKASH" className="text-xs">bKash (MFS)</SelectItem>
                          <SelectItem value="NAGAD" className="text-xs">Nagad (MFS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* STEP 5: Success Summary */}
                {wizardStep === 5 && draftedOrder && draftedInvoice && (
                  <div className="space-y-6 max-w-md mx-auto py-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <Check className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">Sales Workflow Completed!</h3>
                      <p className="text-xs text-muted-foreground">
                        Order was drafted, an invoice issued, and the payment collection successfully logged. All sub-ledgers updated.
                      </p>
                    </div>

                    <div className="border border-neutral-100 dark:border-neutral-900 rounded-lg p-4 bg-neutral-50/50 dark:bg-neutral-900/50 text-left space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Sales Order ID:</span>
                        <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{draftedOrder.id}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Invoice Reference:</span>
                        <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">{draftedInvoice.id}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total Paid Amount:</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">৳{draftedOrder.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Collection Method:</span>
                        <span className="capitalize font-semibold text-neutral-800 dark:text-neutral-200">{paymentMethod.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </div>

                    <Button onClick={resetWizard} className="text-xs w-full">
                      Initiate New Workflow
                    </Button>
                  </div>
                )}

                {/* Navigation Actions */}
                {wizardStep < 5 && (
                  <div className="border-t border-neutral-100 dark:border-neutral-900 mt-6 pt-4 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevStep}
                      disabled={wizardStep === 1}
                      className="text-xs gap-1.5"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNextStep}
                      className="text-xs gap-1.5"
                    >
                      {wizardStep === 4 ? 'Confirm & Record' : 'Continue'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageShell>

      {/* Details Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedOrder && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedOrder.id}
                  </span>
                  <StatusBadge status={selectedOrder.status} />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">Order Breakdown</SheetTitle>
                <span className="text-xs text-muted-foreground">
                  Logged on {new Date(selectedOrder.date).toLocaleString()}
                </span>
              </SheetHeader>

              <div className="py-6 space-y-6 text-sm">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Customer Profile</span>
                  <div className="font-semibold text-slate-700">{selectedOrder.customerName}</div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-2">Order Details</span>
                  <div className="border rounded-lg bg-slate-50/50 overflow-hidden border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/80 border-b font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-3">SKU / Item Name</th>
                          <th className="p-3 text-right">Qty</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3">
                              <span className="font-mono text-[10px] text-muted-foreground block">{item.sku}</span>
                              <span className="font-medium">{item.name}</span>
                            </td>
                            <td className="p-3 text-right font-medium">{item.qty}</td>
                            <td className="p-3 text-right font-mono font-semibold text-slate-700">
                              ৳{(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-100/30 font-bold">
                          <td className="p-3 text-right" colSpan={2}>Grand Total</td>
                          <td className="p-3 text-right font-mono text-primary">
                            ৳{selectedOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-3">Workflow Timeline</span>
                  <div className="relative border-l pl-4 ml-2 space-y-4 text-xs">
                    {selectedOrder.timeline.map((event, index) => (
                      <div key={index} className="relative">
                        <span className="absolute -left-[21px] top-0.5 size-2.5 rounded-full border bg-white border-primary" />
                        <div className="grid gap-0.5">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(event.date).toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <StatusBadge status={event.status} />
                          </div>
                          <span className="text-muted-foreground text-xs mt-0.5">{event.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
