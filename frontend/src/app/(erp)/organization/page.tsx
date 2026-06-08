'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Landmark,
  Warehouse,
  Users,
  ShoppingBasket,
  DollarSign,
  ArrowUpRight,
  Zap,
  ShieldAlert,
  Settings,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  useOrgUsers,
  useOrgRoles,
  useOrgAuditLogs,
  useSubscriptionUsage,
} from '@/services/query/hooks';

export default function OrganizationPage() {
  const { data: users = [], isLoading: usersLoading } = useOrgUsers();
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles();
  const { data: auditLogs = [], isLoading: auditLoading } = useOrgAuditLogs();
  const { data: usage, isLoading: usageLoading } = useSubscriptionUsage();

  const [activeTab, setActiveTab] = useState('profile');
  const [roleSearch, setRoleSearch] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Operator');

  const handleUpgrade = () => {
    toast.success('Initiating subscription upgrade checkout...');
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) {
      toast.error('Please specify an invite email');
      return;
    }
    toast.success(`Invite sent successfully to ${newUserEmail} as ${newUserRole}!`);
    setNewUserEmail('');
  };

  const auditColumns = [
    {
      header: 'User',
      accessor: (row: any) => <span className="font-medium text-foreground">{row.user}</span>,
    },
    {
      header: 'Action',
      accessor: (row: any) => <span className="text-slate-700 dark:text-slate-300 font-semibold">{row.action}</span>,
    },
    {
      header: 'Module',
      accessor: (row: any) => (
        <Badge variant="outline" className="text-[10px] font-semibold uppercase bg-slate-50/50 dark:bg-slate-900/50">
          {row.module}
        </Badge>
      ),
    },
    {
      header: 'Timestamp',
      accessor: (row: any) => (
        <span className="text-muted-foreground text-xs">
          {new Date(row.timestamp).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: 'IP Address',
      accessor: (row: any) => <span className="font-mono text-xs text-muted-foreground">{row.ipAddress}</span>,
    },
    {
      header: 'Status',
      accessor: (row: any) => <StatusBadge status={row.status === 'SUCCESS' ? 'ACTIVE' : 'FAILED'} />,
    },
  ];

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(roleSearch.toLowerCase())
  );

  return (
    <PageShell
      title="Organization Overview"
      description="Configure multi-tenant company details, subscriptions, user privileges, and system audit trails."
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-neutral-100/50 dark:bg-neutral-900/50 p-1 border rounded-lg">
          <TabsTrigger value="profile" className="text-xs cursor-pointer">
            Profile & Billing
          </TabsTrigger>
          <TabsTrigger value="admin" className="text-xs cursor-pointer flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> Administrative Workspace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Business Name</span>
                <Building2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold truncate">AgriQon Corporation</div>
                <p className="text-[10px] text-muted-foreground mt-1">Multi-tenant Main Instance</p>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Tax ID / BIN</span>
                <Landmark className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono font-bold">BIN-882-990-1</div>
                <p className="text-[10px] text-muted-foreground mt-1">Registered Tax Authority</p>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Active Warehouses</span>
                <Warehouse className="h-4 w-4 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {usage ? `${usage.warehousesUsed} / ${usage.warehousesLimit}` : '...'}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Regional distribution hubs</p>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Active Members</span>
                <Users className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {usage ? `${usage.usersUsed} / ${usage.usersLimit}` : '...'}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Seat slots consumed</p>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">SKU Count</span>
                <ShoppingBasket className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {usage ? `${usage.productsUsed} / ${usage.productsLimit}` : '...'}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Catalog items registered</p>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Revenue</span>
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-emerald-600">৳240,500</div>
                <p className="text-[10px] text-muted-foreground mt-1">Accrued current billing</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Subscription Plans */}
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm lg:col-span-2 bg-white/70 dark:bg-black/35 backdrop-blur-md">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold">Subscription Summary</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Scale resources and invite more staff</CardDescription>
                  </div>
                  {usage && (
                    <Badge className="bg-primary hover:bg-primary text-xs flex gap-1 items-center px-2 py-0.5">
                      <Zap className="h-3 w-3 fill-white" />
                      {usage.planName} Plan
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="py-5">
                <div className="grid gap-6 md:grid-cols-3 text-xs mb-5">
                  <div className="border p-4 rounded-xl flex flex-col justify-between bg-neutral-50/50 dark:bg-neutral-950/20 border-neutral-200 dark:border-neutral-800">
                    <div>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 text-sm block">Starter</span>
                      <span className="text-muted-foreground mt-1 block">For small farms just getting started.</span>
                    </div>
                    <span className="font-bold mt-4 block text-neutral-500">Free / Manual</span>
                  </div>
                  <div className="border-2 border-primary p-4 rounded-xl flex flex-col justify-between bg-primary/5 relative">
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-primary text-[8px] font-bold text-white uppercase tracking-wider">Active</span>
                    <div>
                      <span className="font-bold text-primary text-sm block">Growth</span>
                      <span className="text-muted-foreground mt-1 block">Full automation for commercial growers.</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-bold text-primary">৳4,500/mo</span>
                    </div>
                  </div>
                  <div className="border p-4 rounded-xl flex flex-col justify-between bg-neutral-50/50 dark:bg-neutral-950/20 border-neutral-200 dark:border-neutral-800">
                    <div>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 text-sm block">Enterprise</span>
                      <span className="text-muted-foreground mt-1 block">Multi-tenant hubs and priority SLA support.</span>
                    </div>
                    <span className="font-bold mt-4 block text-neutral-500 font-semibold">Custom Pricing</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Plan renews on <span className="font-semibold text-neutral-700 dark:text-neutral-300">{usage?.renewalDate}</span>
                  </span>
                  <Button onClick={handleUpgrade} size="sm" className="text-xs gap-1.5 cursor-pointer font-semibold shadow-sm">
                    Upgrade Plan Space
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resource consumption progress bars */}
            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-sm bg-white/70 dark:bg-black/35 backdrop-blur-md">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-4">
                <CardTitle className="text-base font-bold">Resource Consumption</CardTitle>
                <CardDescription className="text-xs mt-0.5">Allocation limits according to active plan.</CardDescription>
              </CardHeader>
              <CardContent className="py-5 space-y-4 text-xs">
                {usage ? (
                  <React.Fragment>
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-neutral-700 dark:text-neutral-300">Seat Allocations</span>
                        <span className="text-muted-foreground">{usage.usersUsed} / {usage.usersLimit} Users</span>
                      </div>
                      <Progress value={(usage.usersUsed / usage.usersLimit) * 100} className="h-1.5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-neutral-700 dark:text-neutral-300">Regional Warehouses</span>
                        <span className="text-muted-foreground">{usage.warehousesUsed} / {usage.warehousesLimit} Hubs</span>
                      </div>
                      <Progress value={(usage.warehousesUsed / usage.warehousesLimit) * 100} className="h-1.5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-neutral-700 dark:text-neutral-300">Catalog SKU Limit</span>
                        <span className="text-muted-foreground">{usage.productsUsed} / {usage.productsLimit} Products</span>
                      </div>
                      <Progress value={(usage.productsUsed / usage.productsLimit) * 100} className="h-1.5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between font-semibold">
                        <span className="text-neutral-700 dark:text-neutral-300">Secure Storage</span>
                        <span className="text-muted-foreground">{usage.storageUsedGB}GB / {usage.storageLimitGB}GB</span>
                      </div>
                      <Progress value={(usage.storageUsedGB / usage.storageLimitGB) * 100} className="h-1.5" />
                    </div>
                  </React.Fragment>
                ) : (
                  <div className="text-center py-6 text-xs text-muted-foreground">Loading utilization metrics...</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Administrative Workspace (Users directory, Roles checklist, Audits log) */}
        <TabsContent value="admin" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Roles Matrix & Invite */}
            <div className="lg:col-span-2 space-y-6">
              {/* Users Directory */}
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-3 flex flex-row justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-bold">User Directory</CardTitle>
                    <CardDescription className="text-xs">Active staff members and roles inside the tenant workspace.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-3">
                    {users.map((u) => (
                      <div key={u.email} className="flex justify-between items-center p-2 rounded border border-neutral-100 dark:border-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 text-xs">
                        <div className="grid gap-0.5">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{u.name}</span>
                          <span className="text-muted-foreground text-[10px]">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize text-[10px]">{u.role}</Badge>
                          <StatusBadge status={u.status === 'SUSPENDED' ? 'INACTIVE' : u.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Roles Matrix */}
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold">Roles and Privileges Matrix</CardTitle>
                    <CardDescription className="text-xs">Verify module authorizations per security group.</CardDescription>
                  </div>
                  <div className="relative w-full md:w-48">
                    <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Filter roles..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      className="pl-7 h-8 text-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {filteredRoles.map((role) => (
                      <div key={role.name} className="border rounded-lg p-3 bg-neutral-50/50 dark:bg-neutral-900/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{role.name}</span>
                          <Badge variant="outline" className="text-[9px] uppercase">{role.roleType}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-3">
                          Workspace endpoints authorized: {role.permissionsCount} modules. Created by: {role.createdBy}.
                        </p>
                        
                        <div className="flex flex-wrap gap-1.5 text-[10px] text-neutral-400 font-semibold">
                          Active Members Assigned: {role.userCount} user seat(s)
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Invite Form */}
            <div className="space-y-6">
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-3">
                  <CardTitle className="text-sm font-bold">Invite New Administrator</CardTitle>
                  <CardDescription className="text-xs">Send credential creation links to assign system seats.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleInviteUser} className="space-y-4">
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Email Address *</Label>
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="text-xs h-10"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs">Designated Security Role</Label>
                      <Select value={newUserRole} onValueChange={setNewUserRole}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Choose Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manager" className="text-xs">Manager</SelectItem>
                          <SelectItem value="Operator" className="text-xs">Operator</SelectItem>
                          <SelectItem value="Auditor" className="text-xs">Auditor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" className="text-xs h-10 w-full mt-2">
                      Send Secure Invite
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Audit Logs */}
          <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-black/35 backdrop-blur-md shadow-sm">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-900 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">System Audit Trail</CardTitle>
                <CardDescription className="text-xs mt-0.5">Immutable records of workspace operations.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={auditLogs}
                columns={auditColumns}
                searchPlaceholder="Filter audit trail by action, module, or operator..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
