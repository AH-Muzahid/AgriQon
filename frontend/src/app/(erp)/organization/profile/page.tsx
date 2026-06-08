'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, UploadCloud, Check } from 'lucide-react';
import { toast } from 'sonner';

const profileFormSchema = z.object({
  businessName: z.string().min(2, { message: 'Business name must be at least 2 characters.' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters.' }).regex(/^[a-z0-9-]+$/, { message: 'Slug must contain lowercase alphanumeric characters or hyphens only.' }),
  email: z.string().email({ message: 'Provide a valid contact email.' }),
  phone: z.string().min(6, { message: 'Provide a valid telephone contact.' }),
  address: z.string().min(5, { message: 'Warehouse address details are required.' }),
  taxId: z.string().min(5, { message: 'Provide tax identifier registration number.' }),
  currency: z.string().min(1, { message: 'Please select billing currency.' }),
  timezone: z.string().min(1, { message: 'Please configure local timezone.' }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function BusinessProfilePage() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      businessName: 'AgriQon Corporation',
      slug: 'agriqon',
      email: 'operations@agriqon.com',
      phone: '+880 2-9884432',
      address: 'Tejgaon Industrial Area, Dhaka-1208, Bangladesh',
      taxId: 'BIN-882-990-1',
      currency: 'BDT (৳)',
      timezone: 'Asia/Dhaka (GMT+6)',
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    console.log('Saved Business Data:', data);
    toast.success('Business settings and metadata updated successfully!');
  };

  return (
    <PageShell
      title="Business Profile Settings"
      description="Update organization configurations, slug pointers, tax details, and regional preferences."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card & Upload */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-800">Identity Details</CardTitle>
            <CardDescription className="text-xs">Manage corporate logos and brand marks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center py-6 border border-dashed rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-all border-slate-200">
              <div className="size-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Building2 className="size-8" />
              </div>
              <span className="text-xs font-bold text-slate-700">Company Logo</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">PNG or JPG up to 2MB</span>
              
              <Button type="button" variant="outline" size="sm" className="mt-4 gap-1.5 text-xs cursor-pointer" onClick={() => toast.info('Mock File upload triggered')}>
                <UploadCloud className="size-4" />
                Upload New Image
              </Button>
            </div>
            
            <div className="text-xs space-y-2.5 pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verification status:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="size-3.5 stroke-[3px]" />
                  Active BIN
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active URL Slug:</span>
                <span className="font-mono text-[10px] bg-slate-100 border text-slate-700 px-1.5 py-0.5 rounded font-semibold">
                  /erp/agriqon
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings Form */}
        <Card className="border shadow-sm md:col-span-2">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Business Details</CardTitle>
            <CardDescription className="text-xs">Provide details for invoices and billing operations.</CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Business Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. AgriQon Corporation" {...field} className="text-xs bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">System URL Slug *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. agriqon" {...field} className="text-xs bg-background" />
                        </FormControl>
                        <FormDescription className="text-[10px]">Alphanumeric lowercase and hyphens only.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Contact Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. contact@domain.com" {...field} className="text-xs bg-background" />
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
                        <FormLabel className="text-xs font-semibold">Telephone Contact *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. +880 1..." {...field} className="text-xs bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">Primary Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Registered corporate address..." {...field} className="text-xs bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold">BIN / Tax Registration Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="BIN-000-000-0" {...field} className="text-xs bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">Billing Currency *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs bg-background">
                              <SelectValue placeholder="Select base currency..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BDT (৳)" className="text-xs">BDT (৳) - Taka</SelectItem>
                            <SelectItem value="USD ($)" className="text-xs">USD ($) - Dollar</SelectItem>
                            <SelectItem value="EUR (€)" className="text-xs">EUR (€) - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold">System Timezone *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-xs bg-background">
                              <SelectValue placeholder="Select timezone..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Asia/Dhaka (GMT+6)" className="text-xs">Asia/Dhaka (GMT+6)</SelectItem>
                            <SelectItem value="Asia/Kolkata (GMT+5:30)" className="text-xs">Asia/Kolkata (GMT+5:30)</SelectItem>
                            <SelectItem value="UTC (GMT+0)" className="text-xs">UTC (GMT+0)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t gap-3">
                  <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button type="submit" size="sm" className="text-xs font-semibold">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
