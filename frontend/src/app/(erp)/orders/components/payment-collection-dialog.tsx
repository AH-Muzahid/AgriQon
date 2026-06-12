'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { paymentCollectionSchema, PaymentCollectionFormValues } from '../schemas/order.schema';

interface PaymentCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PaymentCollectionFormValues) => Promise<void>;
  invoiceNumber: string;
  dueAmount: number;
  isPending: boolean;
}

export function PaymentCollectionDialog({
  open,
  onOpenChange,
  onSubmit,
  invoiceNumber,
  dueAmount,
  isPending,
}: PaymentCollectionDialogProps) {
  const form = useForm<PaymentCollectionFormValues>({
    resolver: zodResolver(paymentCollectionSchema),
    defaultValues: {
      amount: 0,
      method: 'CASH',
      transactionId: '',
      gateway: 'OFFLINE',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        amount: Number(dueAmount),
        method: 'CASH',
        transactionId: '',
        gateway: 'OFFLINE',
      });
    }
  }, [open, dueAmount, form]);

  const handleFormSubmit = async (values: PaymentCollectionFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
          <DialogDescription>
            Register a customer remittance against tax invoice <strong>{invoiceNumber}</strong>. Outstanding balance: <strong>${dueAmount.toFixed(2)}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Remittance Amount ($) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Payment Channel *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment channel..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CASH">Cash Payment</SelectItem>
                      <SelectItem value="BKASH">MFS - bKash</SelectItem>
                      <SelectItem value="NAGAD">MFS - Nagad</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Wire Transfer</SelectItem>
                      <SelectItem value="CARD">Debit / Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transactionId"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Reference / Transaction ID</FormLabel>
                  <FormControl>
                    <Input placeholder="TXN123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Record Collection
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
