'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Loader2, Plus } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderSchema, OrderFormValues } from '../schemas/order.schema';
import { EntitySearchCombobox } from '@/components/business/EntitySearchCombobox';

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OrderFormValues) => Promise<void>;
  warehouses: any[];
  isPending: boolean;
}

export function OrderFormDialog({
  open,
  onOpenChange,
  onSubmit,
  warehouses,
  isPending,
}: OrderFormDialogProps) {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: '',
      warehouseId: '',
      items: [{ itemId: '', quantity: 1, unitPrice: 0.01 }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'items',
    control: form.control,
  });

  const formValues = form.watch();
  const estimatedTotal = formValues.items?.reduce((sum, item) => {
    return sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0));
  }, 0) || 0;

  const handleFormSubmit = async (values: OrderFormValues) => {
    await onSubmit(values);
    form.reset({
      customerId: '',
      warehouseId: '',
      items: [{ itemId: '', quantity: 1, unitPrice: 0.01 }],
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sales Order</DialogTitle>
          <DialogDescription>
            Book a new customer order. Stock will be reserved and an Invoice generated automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
            
            {/* Customer Search Autocomplete */}
            <div className="space-y-2">
              <Label>Select Customer *</Label>
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }: any) => (
                  <FormItem>
                    <FormControl>
                      <EntitySearchCombobox
                        endpoint="/customers"
                        placeholder="Search customer account..."
                        value={field.value}
                        onChange={field.onChange}
                        displayValue={(c) => `${c.name} (${c.phone || 'No Phone'})`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Warehouse Intake */}
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Source Warehouse *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Dispatch warehouse..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Line Items Array */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center border-b pb-1.5">
                <span className="text-sm font-semibold">Line Items (SKUs)</span>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ itemId: '', quantity: 1, unitPrice: 0.01 })} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add SKU
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2.5 items-end bg-muted/20 p-2.5 rounded-lg border border-muted">
                    {/* Async Product SKU selector */}
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs">Product *</Label>
                      <FormField
                        control={form.control}
                        name={`items.${index}.itemId`}
                        render={({ field: selectField }: any) => (
                          <FormItem>
                            <FormControl>
                              <EntitySearchCombobox
                                endpoint="/products"
                                placeholder="Search product..."
                                value={selectField.value}
                                onChange={selectField.onChange}
                                displayValue={(p) => `${p.name} (${p.sku})`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-[80px]">
                      <Label className="text-xs">Qty *</Label>
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field: inputField }: any) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                className="h-10"
                                {...inputField}
                                onChange={(e) => inputField.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-[100px]">
                      <Label className="text-xs">Price *</Label>
                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field: priceField }: any) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                className="h-10"
                                {...priceField}
                                onChange={(e) => priceField.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="button" variant="ghost" size="icon" className="text-destructive h-10" disabled={fields.length === 1} onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Total Card */}
            <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg border border-primary/20">
              <span className="text-xs text-muted-foreground font-medium uppercase">Estimated Order Value (Net)</span>
              <span className="text-lg font-bold text-primary">
                ${estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
