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
import { Shield, Plus, Copy, Eye, ShieldAlert, Award, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_ROLES, MockRole } from '@/lib/mock-erp-data';

export default function TeamRolesPage() {
  const [roles, setRoles] = useState<MockRole[]>(MOCK_ROLES);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<MockRole | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [newRole, setNewRole] = useState({
    name: '',
    roleType: 'Custom' as 'System' | 'Custom',
    permissionsCount: '10',
  });

  const filteredRoles = roles.filter((r) => {
    return r.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name) {
      toast.error('Role name is required');
      return;
    }

    const created: MockRole = {
      name: newRole.name,
      roleType: newRole.roleType,
      userCount: 0,
      permissionsCount: parseInt(newRole.permissionsCount) || 0,
      createdBy: 'muzahid@agroai.com',
    };

    setRoles([...roles, created]);
    setCreateDialogOpen(false);
    toast.success(`Role ${created.name} defined successfully`);

    // Reset Form
    setNewRole({
      name: '',
      roleType: 'Custom',
      permissionsCount: '10',
    });
  };

  const handleCloneRole = (role: MockRole) => {
    const cloned: MockRole = {
      name: `${role.name} (Copy)`,
      roleType: 'Custom',
      userCount: 0,
      permissionsCount: role.permissionsCount,
      createdBy: 'muzahid@agroai.com',
    };
    setRoles([...roles, cloned]);
    toast.success(`Role ${role.name} cloned to custom configurations!`);
  };

  const columns = [
    {
      header: 'Role Name',
      accessor: (row: MockRole) => (
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Shield className="size-3.5 text-primary" />
          {row.name}
        </span>
      ),
    },
    {
      header: 'Type',
      accessor: (row: MockRole) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
          row.roleType === 'System' 
            ? 'bg-slate-100 text-slate-700 border-slate-200' 
            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
        }`}>
          {row.roleType}
        </span>
      ),
    },
    {
      header: 'Assigned Staff',
      accessor: (row: MockRole) => (
        <span className="font-semibold">{row.userCount} user{row.userCount === 1 ? '' : 's'}</span>
      ),
    },
    {
      header: 'Permissions Bound',
      accessor: (row: MockRole) => (
        <span className="font-mono text-xs">{row.permissionsCount} rules</span>
      ),
    },
    {
      header: 'Created By',
      accessor: (row: MockRole) => (
        <span className="text-muted-foreground text-xs">{row.createdBy}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: MockRole) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 cursor-pointer text-xs"
            onClick={() => {
              setSelectedRole(row);
              setSheetOpen(true);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            Rules Matrix
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 cursor-pointer"
            onClick={() => handleCloneRole(row)}
            title="Clone Role"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Role Management"
        description="Define workspace role hierarchies, duplicate permission models, and monitor security access scopes."
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                Define Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Define Custom Role</DialogTitle>
                <DialogDescription>
                  Define a new role schema to assign customizable security rules.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRole} className="grid gap-4 py-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold">Role Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Procurement Lead"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    required
                    className="text-xs bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="roleType" className="text-xs font-semibold">Role Type</Label>
                    <Select
                      value={newRole.roleType}
                      onValueChange={(val) => setNewRole({ ...newRole, roleType: val as 'System' | 'Custom' })}
                    >
                      <SelectTrigger className="w-full bg-background text-xs">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Custom" className="text-xs">Custom</SelectItem>
                        <SelectItem value="System" className="text-xs">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="rules" className="text-xs font-semibold">Initial Rule Count</Label>
                    <Input
                      id="rules"
                      type="number"
                      placeholder="e.g. 10"
                      value={newRole.permissionsCount}
                      onChange={(e) => setNewRole({ ...newRole, permissionsCount: e.target.value })}
                      className="text-xs bg-background font-mono"
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Define Role</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Statistics grids */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">System Roles</span>
              <ShieldAlert className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roles.filter((r) => r.roleType === 'System').length} Roles</div>
              <p className="text-[10px] text-muted-foreground mt-1">Default immutable templates</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Custom Roles Defined</span>
              <Award className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {roles.filter((r) => r.roleType === 'Custom').length} Roles
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Tenant-defined local overrides</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Covered Seat Assignments</span>
              <UserCheck className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {roles.reduce((acc, curr) => acc + curr.userCount, 0)} Seats
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Staff mapped to system policies</p>
            </CardContent>
          </Card>
        </div>

        {/* Roles Table */}
        <DataTable
          data={filteredRoles}
          columns={columns}
          searchPlaceholder="Search roles by title..."
          searchValue={search}
          onSearchChange={setSearch}
          emptyStateTitle="No Roles Configured"
          emptyStateDescription="Manage user grouping rules and duplicate authorization sets."
        />
      </PageShell>

      {/* Role details sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedRole && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    selectedRole.roleType === 'System' 
                      ? 'bg-slate-100 text-slate-700 border-slate-200' 
                      : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                  }`}>
                    {selectedRole.roleType}
                  </span>
                </div>
                <SheetTitle className="text-xl font-bold mt-2">{selectedRole.name}</SheetTitle>
                <SheetDescription>Workspace permissions rules breakdown.</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6 text-sm">
                <div className="border bg-slate-50 p-4 rounded-xl space-y-3 border-slate-200 text-xs">
                  <span className="font-bold text-slate-700 block">Security Policy Details</span>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Permission Rules Bound:</span>
                      <span className="font-bold text-slate-700">{selectedRole.permissionsCount} active claims</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned Seat count:</span>
                      <span className="font-semibold text-slate-700">{selectedRole.userCount} users</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Policy Owner:</span>
                      <span className="font-semibold text-slate-700">{selectedRole.createdBy}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full text-xs cursor-pointer"
                    onClick={() => {
                      toast.info(`Navigating to Permission Matrix filter: ${selectedRole.name}`);
                      setSheetOpen(false);
                    }}
                  >
                    Modify Access Matrix Grid
                  </Button>
                </div>
              </div>
            </React.Fragment>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
