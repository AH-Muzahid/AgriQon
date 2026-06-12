'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Database,
  Layers,
  Building,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';

interface TenantsTableProps {
  tenantsData: any;
  loading: boolean;
  currentPage: number;
  planCode: string;
  status: string;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onParamsChange: (newParams: {
    page?: number;
    planCode?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => void;
  onOpenOverride: (tenant: any) => void;
}

export function TenantsTable({
  tenantsData,
  loading,
  currentPage,
  planCode,
  status,
  search,
  sortBy,
  sortOrder,
  onParamsChange,
  onOpenOverride,
}: TenantsTableProps) {
  const [localSearch, setLocalSearch] = useState(search);

  // Sync local search state with prop changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Handle Enter key for search input
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onParamsChange({ search: localSearch, page: 1 });
    }
  };

  const toggleSortOrder = () => {
    onParamsChange({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name or email (Press Enter)..."
            className="pl-9 border-slate-800 bg-slate-900 text-slate-100 placeholder:text-slate-500"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Plan Filter */}
          <Select value={planCode || 'ALL'} onValueChange={(val) => onParamsChange({ planCode: val === 'ALL' ? '' : val, page: 1 })}>
            <SelectTrigger className="w-36 h-10 border-slate-800 bg-slate-900 text-slate-100 text-xs">
              <SelectValue placeholder="Plan: All" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
              <SelectItem value="ALL" className="text-xs">All Plans</SelectItem>
              <SelectItem value="TRIAL" className="text-xs">Trial</SelectItem>
              <SelectItem value="PRO" className="text-xs">Pro</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={status || 'ALL'} onValueChange={(val) => onParamsChange({ status: val === 'ALL' ? '' : val, page: 1 })}>
            <SelectTrigger className="w-36 h-10 border-slate-800 bg-slate-900 text-slate-100 text-xs">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
              <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
              <SelectItem value="TRIAL" className="text-xs">Trial</SelectItem>
              <SelectItem value="ACTIVE" className="text-xs">Active</SelectItem>
              <SelectItem value="GRACE_PERIOD" className="text-xs">Grace Period</SelectItem>
              <SelectItem value="SUSPENDED" className="text-xs">Suspended</SelectItem>
              <SelectItem value="CANCELLED" className="text-xs">Cancelled</SelectItem>
              <SelectItem value="EXPIRED" className="text-xs">Expired</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort By Filter */}
          <Select value={sortBy || 'createdAt'} onValueChange={(val) => onParamsChange({ sortBy: val, page: 1 })}>
            <SelectTrigger className="w-40 h-10 border-slate-800 bg-slate-900 text-slate-100 text-xs">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="border-slate-800 bg-slate-900 text-slate-100">
              <SelectItem value="createdAt" className="text-xs">Date Registered</SelectItem>
              <SelectItem value="plan" className="text-xs">Plan</SelectItem>
              <SelectItem value="status" className="text-xs">Status</SelectItem>
              <SelectItem value="revenue" className="text-xs">Revenue</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
            onClick={toggleSortOrder}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          {/* Reset Filters */}
          {(search || planCode || status || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-400 hover:text-white font-medium"
              onClick={() => {
                setLocalSearch('');
                onParamsChange({
                  page: 1,
                  planCode: '',
                  status: '',
                  search: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                });
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Tenants Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
        <Table>
          <TableHeader className="bg-slate-900 border-b border-slate-800">
            <TableRow>
              <TableHead className="text-slate-300 font-semibold">Tenant Info</TableHead>
              <TableHead className="text-slate-300 font-semibold">Plan</TableHead>
              <TableHead className="text-slate-300 font-semibold">SaaS Status</TableHead>
              <TableHead className="text-slate-300 font-semibold">Expiration</TableHead>
              <TableHead className="text-slate-300 font-semibold text-center">ERP Usage (Users / Products / Whs)</TableHead>
              <TableHead className="text-slate-300 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <TableRow key={i} className="border-b border-slate-800/50">
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : !tenantsData?.tenants || tenantsData.tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500 font-medium">
                  No platform tenants found matching the search criteria.
                </TableCell>
              </TableRow>
            ) : (
              tenantsData.tenants.map((tenant: any) => (
                <TableRow key={tenant.id} className="hover:bg-slate-800/20 border-b border-slate-800/50">
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-slate-100 flex items-center space-x-1.5">
                        <Building className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{tenant.name}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{tenant.email || 'No email registered'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 font-bold">
                      {tenant.subscription?.planCode || 'TRIAL'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      tenant.subscription?.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                        : tenant.subscription?.status === 'TRIAL'
                        ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20'
                        : tenant.subscription?.status === 'GRACE_PERIOD'
                        ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20'
                        : 'bg-red-500/15 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                    }>
                      {tenant.subscription?.status || 'TRIAL'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300 font-medium">
                    {tenant.subscription?.expiresAt
                      ? new Date(tenant.subscription.expiresAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    <div className="flex items-center justify-center space-x-2 text-xs">
                      <span className="text-slate-300 flex items-center space-x-1">
                        <Users className="h-3.5 w-3.5 text-slate-500 mr-0.5" /> {tenant.usage.users}
                      </span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-300 flex items-center space-x-1">
                        <Database className="h-3.5 w-3.5 text-slate-500 mr-0.5" /> {tenant.usage.products}
                      </span>
                      <span className="text-slate-500">/</span>
                      <span className="text-slate-300 flex items-center space-x-1">
                        <Layers className="h-3.5 w-3.5 text-slate-500 mr-0.5" /> {tenant.usage.warehouses}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
                      onClick={() => onOpenOverride(tenant)}
                    >
                      Manual Override
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Table Pagination */}
      {tenantsData?.pagination && (
        <div className="flex items-center justify-between py-2.5">
          <div className="text-xs text-slate-400 font-medium">
            Showing page <span className="font-bold text-slate-200">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-200">{tenantsData.pagination.totalPages || 1}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-50"
              disabled={currentPage === 1 || loading}
              onClick={() => onParamsChange({ page: currentPage - 1 })}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-50"
              disabled={currentPage === tenantsData.pagination.totalPages || loading}
              onClick={() => onParamsChange({ page: currentPage + 1 })}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
