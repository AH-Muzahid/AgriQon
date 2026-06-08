'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, ShieldAlert, Shield, Search, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Define initial mapping
const INITIAL_MATRIX: Record<string, Record<string, boolean>> = {
  Dashboard: { View: true, Create: false, Update: false, Delete: false, Export: true, Approve: false },
  Products: { View: true, Create: true, Update: true, Delete: false, Export: true, Approve: false },
  Inventory: { View: true, Create: true, Update: true, Delete: false, Export: true, Approve: true },
  Customers: { View: true, Create: true, Update: true, Delete: false, Export: true, Approve: false },
  Orders: { View: true, Create: true, Update: true, Delete: false, Export: true, Approve: true },
  Invoices: { View: true, Create: true, Update: true, Delete: false, Export: true, Approve: true },
  Payments: { View: true, Create: true, Update: true, Delete: false, Export: true, Approve: true },
  Reports: { View: true, Create: false, Update: false, Delete: false, Export: true, Approve: false },
  Organization: { View: true, Create: false, Update: true, Delete: false, Export: false, Approve: false },
  AI: { View: true, Create: true, Update: false, Delete: false, Export: true, Approve: false },
};

const ACTIONS = ['View', 'Create', 'Update', 'Delete', 'Export', 'Approve'];

export default function TeamPermissionsPage() {
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(INITIAL_MATRIX);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [activeRole, setActiveRole] = useState('Manager');

  // Filter modules
  const filteredModules = Object.keys(matrix).filter((mod) => {
    const matchesSearch = mod.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'ALL' || mod === moduleFilter;
    return matchesSearch && matchesModule;
  });

  // Calculate totals
  let totalRules = 0;
  let assignedCount = 0;
  Object.keys(matrix).forEach((mod) => {
    Object.keys(matrix[mod]).forEach((act) => {
      totalRules++;
      if (matrix[mod][act]) {
        assignedCount++;
      }
    });
  });

  const handleToggle = (module: string, action: string, checked: boolean) => {
    const updated = { ...matrix };
    updated[module][action] = checked;
    setMatrix(updated);
    toast.success(`Permission updated: ${module} ➔ ${action} set to ${checked ? 'GRANTED' : 'DENIED'}`);
  };

  const handleSaveChanges = () => {
    toast.success(`Matrix configurations persisted for ${activeRole}!`);
  };

  return (
    <PageShell
      title="Access Control Matrix"
      description="Configure systemic permission flags, adjust fine-grained feature constraints, and lock security layers."
      actions={
        <Button onClick={handleSaveChanges} className="text-xs font-semibold shadow-sm cursor-pointer">
          Save Access Policy
        </Button>
      }
    >
      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Rules Managed</span>
            <Shield className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRules} claims</div>
            <p className="text-[10px] text-muted-foreground mt-1">Modules mapped against access verbs</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Granted Permissions</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {assignedCount} claims
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Authorized access routes</p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Restricted Actions</span>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {totalRules - assignedCount} claims
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Explicitly denied access constraints</p>
          </CardContent>
        </Card>
      </div>

      {/* Selector & Filter Bars */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-slate-50 p-4 border rounded-xl border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">Target Role Hierarchy:</span>
          <Select value={activeRole} onValueChange={setActiveRole}>
            <SelectTrigger className="w-48 bg-background text-xs h-9">
              <SelectValue placeholder="Select role template..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Owner" className="text-xs">Owner</SelectItem>
              <SelectItem value="Admin" className="text-xs">Admin</SelectItem>
              <SelectItem value="Manager" className="text-xs">Manager</SelectItem>
              <SelectItem value="Accountant" className="text-xs">Accountant</SelectItem>
              <SelectItem value="Cashier" className="text-xs">Cashier</SelectItem>
              <SelectItem value="Warehouse Operator" className="text-xs">Warehouse Operator</SelectItem>
              <SelectItem value="Sales Executive" className="text-xs">Sales Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs bg-background h-9"
            />
          </div>

          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-40 bg-background text-xs h-9">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs">All Modules</SelectItem>
              {Object.keys(matrix).map((mod) => (
                <SelectItem key={mod} value={mod} className="text-xs">
                  {mod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interactive toggle matrix grid */}
      <Card className="border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 border-b font-semibold text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="p-4 w-60">Module Scope</th>
                {ACTIONS.map((act) => (
                  <th key={act} className="p-4 text-center">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredModules.map((module) => (
                <tr key={module} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-semibold bg-white uppercase">
                      {module}
                    </Badge>
                  </td>
                  {ACTIONS.map((action) => {
                    const isChecked = matrix[module][action] || false;
                    return (
                      <td key={action} className="p-4 text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => handleToggle(module, action, !!checked)}
                            disabled={activeRole === 'Owner'} // Owner has full immutable permission
                            className="cursor-pointer"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex gap-2 items-center text-xs text-muted-foreground bg-slate-50/50 border p-3 rounded-lg">
        <Info className="size-4 text-primary shrink-0" />
        <span>
          Owner permissions are locked at system level and cannot be modified. Standard system roles may have template guidelines.
        </span>
      </div>
    </PageShell>
  );
}
