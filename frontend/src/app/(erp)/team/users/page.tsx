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
import { UserPlus, Eye, Users, ShieldAlert, Clock, Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { MOCK_ROLES, MOCK_WAREHOUSES, MockUser } from '@/lib/mock-erp-data';
import { useOrgUsers, useOrgRoles, useWarehouses, useInviteUser } from '@/services/query/hooks';
import { UserContract } from '@/types/contracts/organization.contract';

export default function TeamUsersPage() {
  const { data: usersData = [], isLoading: usersLoading } = useOrgUsers();
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles();
  const { data: warehouses = [], isLoading: whLoading } = useWarehouses();
  const inviteMutation = useInviteUser();

  const users = usersData;
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<UserContract | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Invite Wizard Steps State
  const [step, setStep] = useState(1);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteWarehouse, setInviteWarehouse] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeSeats = users.filter((u) => u.status === 'ACTIVE').length;
  const pendingInvites = users.filter((u) => u.status === 'PENDING').length;
  const suspendedSeats = users.filter((u) => u.status === 'SUSPENDED').length;

  const handleNextStep = () => {
    if (step === 1 && (!inviteEmail || !inviteName)) {
      toast.error('Please fill in user name and email');
      return;
    }
    if (step === 2 && !inviteRole) {
      toast.error('Please select a workspace role');
      return;
    }
    if (step === 3 && !inviteWarehouse) {
      toast.error('Please assign a physical warehouse node');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSendInvite = () => {
    if (!inviteEmail || !inviteName) {
      toast.error('Name and email are required');
      return;
    }

    let backendRole: 'OWNER' | 'MANAGER' | 'STAFF' = 'STAFF';
    const normRole = inviteRole.toUpperCase();
    if (normRole === 'OWNER') {
      backendRole = 'OWNER';
    } else if (normRole === 'MANAGER' || normRole === 'ADMIN') {
      backendRole = 'MANAGER';
    }

    inviteMutation.mutate(
      {
        email: inviteEmail,
        name: inviteName,
        role: backendRole,
      },
      {
        onSuccess: () => {
          setStep(5);
          toast.success(`Invitation sent to ${inviteEmail}!`);
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to send invitation');
        },
      }
    );
  };

  const handleCloseInvite = () => {
    setInviteDialogOpen(false);
    // Reset wizard
    setStep(1);
    setInviteEmail('');
    setInviteName('');
    setInviteRole('');
    setInviteWarehouse('');
  };

  const columns = [
    {
      header: 'Staff Member',
      accessor: (row: UserContract) => (
        <div className="grid gap-0.5">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Role Title',
      accessor: (row: UserContract) => (
        <span className="font-medium text-slate-700">{row.role}</span>
      ),
    },
    {
      header: 'Assigned Node',
      accessor: (row: UserContract) => (
        <span className="text-muted-foreground text-xs">{row.warehouse}</span>
      ),
    },
    {
      header: 'Last Active',
      accessor: (row: UserContract) => (
        <span className="text-muted-foreground text-xs">{row.lastActive}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: UserContract) => (
        <StatusBadge status={row.status === 'ACTIVE' ? 'ACTIVE' : row.status === 'PENDING' ? 'PENDING' : 'FAILED'} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: UserContract) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedUser(row);
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
        title="Team Directory"
        description="Invite staff members, allocate regional warehouse permissions, and manage active seat listings."
        actions={
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer font-semibold shadow-sm" onClick={() => setStep(1)}>
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex justify-between items-center mr-6">
                  <DialogTitle>Invite Staff Member</DialogTitle>
                  {step < 5 && (
                    <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded">
                      Step {step} of 4
                    </span>
                  )}
                </div>
                {step < 5 && (
                  <DialogDescription>
                    Workspace enrollment credentials wizard.
                  </DialogDescription>
                )}
              </DialogHeader>

              {/* Progress Indicator */}
              {step < 5 && (
                <div className="flex gap-1 h-1 bg-slate-100 rounded-full overflow-hidden my-3">
                  <div className={`h-full bg-primary transition-all duration-300`} style={{ width: `${step * 25}%` }} />
                </div>
              )}

              <div className="py-2">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="inviteName" className="text-xs font-semibold">Staff Full Name *</Label>
                      <Input
                        id="inviteName"
                        placeholder="e.g. Salim Khan"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="text-xs bg-background"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="inviteEmail" className="text-xs font-semibold">Staff Email *</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="e.g. salim@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="text-xs bg-background"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Select Workspace Role</span>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="w-full bg-background text-xs">
                        <SelectValue placeholder="Choose systemic role..." />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r.name} value={r.name} className="text-xs">
                            {r.name} ({r.roleType} role)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Assign Physical Warehouse Node</span>
                    <Select value={inviteWarehouse} onValueChange={setInviteWarehouse}>
                      <SelectTrigger className="w-full bg-background text-xs">
                        <SelectValue placeholder="Select warehouse..." />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map((wh) => (
                          <SelectItem key={wh.id} value={wh.name} className="text-xs">
                            {wh.name} ({wh.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {step === 4 && (
                  <div className="border p-4 rounded-xl bg-slate-50 border-slate-200 space-y-3 text-xs">
                    <span className="font-bold text-slate-800 text-sm block">Review Invitation Metadata</span>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Staff Member:</span>
                        <span className="font-bold text-slate-700">{inviteName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contact Email:</span>
                        <span className="font-semibold text-slate-700">{inviteEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Workspace Role:</span>
                        <span className="font-bold text-primary">{inviteRole}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assigned Warehouse:</span>
                        <span className="font-semibold text-slate-700">{inviteWarehouse}</span>
                      </div>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="flex flex-col items-center py-6 text-center">
                    <div className="size-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <span className="font-bold text-slate-800 text-base">Invitation Transmitted</span>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                      A workspace setup link was successfully sent to <span className="font-semibold text-slate-700">{inviteEmail}</span>.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                {step < 5 ? (
                  <div className="flex justify-between w-full items-center">
                    {step > 1 ? (
                      <Button type="button" variant="ghost" size="sm" onClick={handlePrevStep} className="text-xs">
                        Back
                      </Button>
                    ) : (
                      <div />
                    )}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={handleCloseInvite} className="text-xs">
                        Cancel
                      </Button>
                      {step === 4 ? (
                        <Button type="button" size="sm" onClick={handleSendInvite} className="text-xs font-semibold">
                          Send Invitation
                        </Button>
                      ) : (
                        <Button type="button" size="sm" onClick={handleNextStep} className="text-xs gap-1">
                          Continue
                          <ArrowRight className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Button type="button" onClick={handleCloseInvite} className="w-full text-xs">
                    Close Wizard
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      >
        {/* Statistics cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Active Personnel Seats</span>
              <Users className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{activeSeats} Members</div>
              <p className="text-[10px] text-muted-foreground mt-1">Authorized login credentials</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Invitations</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingInvites} Pending</div>
              <p className="text-[10px] text-muted-foreground mt-1">Invitations awaiting verification</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Suspended Access keys</span>
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">{suspendedSeats} Suspended</div>
              <p className="text-[10px] text-muted-foreground mt-1">Accounts with revoked sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <DataTable
          data={filteredUsers}
          columns={columns}
          searchPlaceholder="Search staff name or contact email..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48 h-10 bg-background text-xs">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Roles</SelectItem>
                  {MOCK_ROLES.map((r) => (
                    <SelectItem key={r.name} value={r.name} className="text-xs">
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
          emptyStateTitle="No Members Found"
          emptyStateDescription="Invite staff workers and allocate permission rules for specific warehouse hubs."
        />
      </PageShell>

      {/* User details sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedUser && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-slate-50 font-bold text-primary px-2 py-0.5">
                    {selectedUser.role}
                  </Badge>
                  <StatusBadge status={selectedUser.status === 'ACTIVE' ? 'ACTIVE' : selectedUser.status === 'PENDING' ? 'PENDING' : 'FAILED'} />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">{selectedUser.name}</SheetTitle>
                <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="size-3.5 text-slate-400" />
                  {selectedUser.email}
                </span>
              </SheetHeader>
              <div className="py-6 space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Assigned Node</span>
                    <span className="font-medium text-slate-800">{selectedUser.warehouse}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Last Active Session</span>
                    <span className="font-medium text-slate-800">{selectedUser.lastActive}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="destructive"
                    className="w-full text-xs cursor-pointer gap-1.5"
                    disabled={selectedUser.role === 'Owner'}
                    onClick={() => {
                      toast.success(`Access keys revoked for ${selectedUser.email}`);
                      setSheetOpen(false);
                    }}
                  >
                    Revoke User Credentials
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
