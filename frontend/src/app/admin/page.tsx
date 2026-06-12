'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { ShieldAlert, RefreshCw } from 'lucide-react';

// Import modular subcomponents
import { SummaryCards } from './components/SummaryCards';
import { RevenueTrendChart } from './components/RevenueTrendChart';
import { GatewayDistributionChart } from './components/GatewayDistributionChart';
import { FunnelDistributionChart } from './components/FunnelDistributionChart';
import { TenantsTable } from './components/TenantsTable';
import { OverrideDialog } from './components/OverrideDialog';

export default function PlatformAdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Component states
  const [summary, setSummary] = useState<any>(null);
  const [tenantsData, setTenantsData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTenants, setLoadingTenants] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting & Filtering States
  const [planCode, setPlanCode] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Override dialog state
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [submittingOverride, setSubmittingOverride] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login');
      } else if ((user.role as string) !== 'SUPER_ADMIN' && (user.role as string) !== 'ADMIN') {
        toast.error('Platform administrator access required.');
        router.push('/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // Fetch summary analytics
  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await apiClient.get('/subscription/admin/analytics/summary') as any;
      if (res.success) {
        setSummary(res.data);
      } else {
        toast.error('Failed to load SaaS analytics summary');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error fetching analytics');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Fetch tenants paginated list
  const fetchTenants = async (
    page = 1,
    pCode = planCode,
    stat = status,
    sch = search,
    sBy = sortBy,
    sOrder = sortOrder
  ) => {
    setLoadingTenants(true);
    try {
      let url = `/subscription/admin/tenants?page=${page}&limit=5`;
      if (pCode) url += `&planCode=${encodeURIComponent(pCode)}`;
      if (stat) url += `&status=${encodeURIComponent(stat)}`;
      if (sch) url += `&search=${encodeURIComponent(sch)}`;
      if (sBy) url += `&sortBy=${encodeURIComponent(sBy)}`;
      if (sOrder) url += `&sortOrder=${encodeURIComponent(sOrder)}`;

      const res = await apiClient.get(url) as any;
      if (res.success) {
        setTenantsData(res.data);
        setCurrentPage(page);
      } else {
        toast.error('Failed to load tenants management list');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error fetching tenants list');
    } finally {
      setLoadingTenants(false);
    }
  };

  const handleParamsChange = (newParams: {
    page?: number;
    planCode?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    let newPage = currentPage;
    let newPlanCode = planCode;
    let newStatus = status;
    let newSearch = search;
    let newSortBy = sortBy;
    let newSortOrder = sortOrder;

    if (newParams.page !== undefined) newPage = newParams.page;
    if (newParams.planCode !== undefined) {
      newPlanCode = newParams.planCode;
      setPlanCode(newPlanCode);
    }
    if (newParams.status !== undefined) {
      newStatus = newParams.status;
      setStatus(newStatus);
    }
    if (newParams.search !== undefined) {
      newSearch = newParams.search;
      setSearch(newSearch);
    }
    if (newParams.sortBy !== undefined) {
      newSortBy = newParams.sortBy;
      setSortBy(newSortBy);
    }
    if (newParams.sortOrder !== undefined) {
      newSortOrder = newParams.sortOrder;
      setSortOrder(newSortOrder);
    }

    fetchTenants(newPage, newPlanCode, newStatus, newSearch, newSortBy, newSortOrder);
  };

  useEffect(() => {
    if (user && ((user.role as string) === 'SUPER_ADMIN' || (user.role as string) === 'ADMIN')) {
      fetchSummary();
      fetchTenants(1, '', '', '', 'createdAt', 'desc');
    }
  }, [user]);

  // Open override dialog
  const handleOpenOverride = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsOverrideOpen(true);
  };

  // Post override handler
  const handleApplyOverride = async (overrideData: {
    planCode: string;
    status: string;
    expiresAt?: string;
    reason: string;
  }) => {
    setSubmittingOverride(true);
    try {
      const res = await apiClient.post(
        `/subscription/admin/tenants/${selectedTenant.id}/override`,
        overrideData
      ) as any;

      if (res.success) {
        toast.success('Tenant subscription overridden successfully');
        setIsOverrideOpen(false);
        fetchTenants(currentPage, planCode, status, search, sortBy, sortOrder);
        fetchSummary();
      } else {
        toast.error(res.message || 'Failed to override subscription');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting override');
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Safe checks for user roles
  if (authLoading || !user || ((user.role as string) !== 'SUPER_ADMIN' && (user.role as string) !== 'ADMIN')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-[200px] w-[350px]" />
      </div>
    );
  }

  // Format currencies
  const formatBDT = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Platform Admin Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Platform Admin Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-medium">SaaS Multi-Tenant Operations Center</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 font-semibold px-2.5 py-1">
            Super Administrator Mode
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            onClick={() => {
              fetchSummary();
              fetchTenants(currentPage);
              toast.success('Dashboard metrics reloaded.');
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* KPI Cards Grid Component */}
        <SummaryCards summary={summary} loading={loadingSummary} formatBDT={formatBDT} />

        {/* Tabs Block */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              SaaS Operational Overview
            </TabsTrigger>
            <TabsTrigger value="tenants" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Tenants & Resource Control ({tenantsData?.pagination?.total || 0})
            </TabsTrigger>
          </TabsList>

          {/* SaaS Operational Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MRR Trend Chart Component */}
              <div className="lg:col-span-2">
                <RevenueTrendChart summary={summary} loading={loadingSummary} />
              </div>

              {/* Gateway Distribution Pie Chart Component */}
              <GatewayDistributionChart summary={summary} loading={loadingSummary} formatBDT={formatBDT} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Funnel breakdown Component */}
              <FunnelDistributionChart summary={summary} loading={loadingSummary} />

              {/* Platform metrics summary panel */}
              <Card className="lg:col-span-2 border-slate-800 bg-slate-900/40">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-slate-200">SaaS Operating Efficiency Metrics</CardTitle>
                  <CardDescription className="text-slate-400">Verified transaction rates and onboarding indexes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Payment Success Index</div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">
                        {summary?.payments?.totalCount > 0
                          ? `${Math.round((summary.payments.verifiedCount / summary.payments.totalCount) * 100)}%`
                          : '100%'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {summary?.payments?.verifiedCount || 0} successes out of {summary?.payments?.totalCount || 0} sessions
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                      <div className="text-xs font-semibold text-slate-400 uppercase">Platform Invoiced vs Realized</div>
                      <div className="text-lg font-bold text-indigo-400 mt-1">
                        {summary?.revenue?.totalInvoiced > 0
                          ? `${Math.round((summary.revenue.totalCollected / summary.revenue.totalInvoiced) * 100)}%`
                          : '0%'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Realized {formatBDT(summary?.revenue?.totalCollected || 0)} from {formatBDT(summary?.revenue?.totalInvoiced || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/80 space-y-2">
                    <div className="text-xs font-semibold text-slate-300">Growth Projection (30 Days Out)</div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Projected New Signups</span>
                      <span className="font-bold text-slate-200">+{Math.round((summary?.conversion?.totalSubscriptions || 0) * 0.15)} tenants</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Estimated Expansion ARR</span>
                      <span className="font-bold text-slate-200">+{formatBDT((summary?.revenue?.mrr || 0) * 0.15 * 12)} BDT</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenants & Resource Control Tab */}
          <TabsContent value="tenants" className="space-y-4">
            <TenantsTable
              tenantsData={tenantsData}
              loading={loadingTenants}
              currentPage={currentPage}
              planCode={planCode}
              status={status}
              search={search}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onParamsChange={handleParamsChange}
              onOpenOverride={handleOpenOverride}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Override Dialog sheet Component */}
      <OverrideDialog
        isOpen={isOverrideOpen}
        onOpenChange={setIsOverrideOpen}
        tenant={selectedTenant}
        submitting={submittingOverride}
        onApplyOverride={handleApplyOverride}
      />
    </div>
  );
}
