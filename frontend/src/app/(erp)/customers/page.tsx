'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_CUSTOMERS, MockCustomer } from '@/lib/mock-erp-data';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Users, Coins, TrendingUp, Handshake, Eye, Mail, Phone, MapPin } from 'lucide-react';

export default function CustomersPage() {
  const [customers] = useState<MockCustomer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<MockCustomer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Filter customers based on search
  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate statistics
  const activeCustomersCount = customers.filter((c) => c.status === 'ACTIVE').length;
  const totalReceivables = customers.reduce((acc, curr) => acc + curr.dueAmount, 0);
  const totalSalesRevenue = customers.reduce((acc, curr) => acc + curr.totalSpent, 0);
  const totalPurchasesCount = customers.reduce((acc, curr) => acc + curr.purchasesCount, 0);

  const columns = [
    {
      header: 'Customer ID',
      accessor: (row: MockCustomer) => (
        <span className="font-mono text-xs text-muted-foreground">{row.id}</span>
      ),
    },
    {
      header: 'Customer Name',
      accessor: (row: MockCustomer) => (
        <div className="grid gap-0.5">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (row: MockCustomer) => (
        <span className="text-muted-foreground text-xs">{row.phone}</span>
      ),
    },
    {
      header: 'Orders Logged',
      accessor: (row: MockCustomer) => (
        <span className="font-semibold">{row.purchasesCount} orders</span>
      ),
    },
    {
      header: 'Total Purchases',
      accessor: (row: MockCustomer) => (
        <span className="font-mono font-medium">৳{row.totalSpent.toLocaleString()}</span>
      ),
    },
    {
      header: 'Outstanding Balance',
      accessor: (row: MockCustomer) => (
        <span className={`font-mono font-bold ${row.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          ৳{row.dueAmount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: MockCustomer) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: MockCustomer) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedCustomer(row);
            setSheetOpen(true);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          Profile File
        </Button>
      ),
      className: "text-right"
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Customers Directory"
        description="Customer profile records, order summaries, outstanding balances, and activity trackers."
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
        />
      </PageShell>

      {/* Customer Profile Sheet Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedCustomer && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedCustomer.id}
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
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{selectedCustomer.address}</span>
                  </div>
                </div>

                {/* Account stats */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Total Spent</span>
                    <span className="font-mono font-bold text-lg text-emerald-600">
                      ৳{selectedCustomer.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Outstanding Due</span>
                    <span className={`font-mono font-bold text-lg ${selectedCustomer.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ৳{selectedCustomer.dueAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Timeline Placeholder */}
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
              </div>
            </React.Fragment>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
