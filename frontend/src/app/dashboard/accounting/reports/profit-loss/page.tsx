'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { 
  ArrowLeft, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ProfitLossAccount {
  name: string;
  amount: number;
}

interface ProfitLossData {
  totals: {
    totalRevenue: number;
    totalCogs: number;
    grossProfit: number;
    totalExpenses: number;
    netIncome: number;
  };
  categories: {
    REVENUE: ProfitLossAccount[];
    COGS: ProfitLossAccount[];
    EXPENSE: ProfitLossAccount[];
  };
}

export default function ProfitAndLossReport() {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = useCallback(async () => {
    // Defer execution to avoid synchronous setState in effect
    await Promise.resolve();
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ProfitLossData>('/accounting/reports/profit-loss', { params: { startDate, endDate } });
      setData(response.data);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to fetch report');
    } finally {

      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const init = async () => {
      await fetchReport();
    };
    init();
  }, [fetchReport]);


  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-rose-100">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={fetchReport}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const chartData = [
    { name: 'Revenue', amount: data.totals.totalRevenue, color: '#10b981' },
    { name: 'COGS', amount: data.totals.totalCogs, color: '#f43f5e' },
    { name: 'Gross Profit', amount: data.totals.grossProfit, color: '#6366f1' },
    { name: 'Expenses', amount: data.totals.totalExpenses, color: '#f59e0b' },
    { name: 'Net Income', amount: data.totals.netIncome, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/accounting/reports" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Profit and Loss Statement</h1>
                <p className="text-xs text-gray-500">Statement of Financial Performance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 transition"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
          <div className="h-8 w-px bg-gray-100 hidden md:block" />
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select className="bg-transparent text-sm font-medium outline-none cursor-pointer">
              <option>Cash Basis</option>
              <option>Accrual Basis</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.totals.totalRevenue)}</h3>
            <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>+14.2% vs last period</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Gross Profit</p>
            <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(data.totals.grossProfit)}</h3>
            <div className="mt-4 flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>{((data.totals.grossProfit / data.totals.totalRevenue) * 100).toFixed(1)}% Margin</span>
            </div>
          </div>
          <div className={`p-6 rounded-2xl border shadow-sm ${data.totals.netIncome >= 0 ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-rose-600 border-rose-500 text-white'}`}>
            <p className="text-sm font-medium opacity-80 mb-1">Net Income</p>
            <h3 className="text-2xl font-bold">{formatCurrency(data.totals.netIncome)}</h3>
            <div className="mt-4 flex items-center gap-1 opacity-90 text-xs font-bold">
              {data.totals.netIncome >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{((data.totals.netIncome / data.totals.totalRevenue) * 100).toFixed(1)}% Net Margin</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Visual Analysis</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number | string | readonly (number | string)[] | null | undefined) => formatCurrency(Number(value ?? 0))}
                  />
                  <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Detailed Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* Revenue Section */}
                  <tr className="bg-emerald-50/30">
                    <td colSpan={2} className="px-6 py-2 text-xs font-bold text-emerald-700 uppercase">Revenue</td>
                  </tr>
                  {data.categories.REVENUE.map((acc: ProfitLossAccount) => (
                    <tr key={acc.name}>
                      <td className="px-6 py-3 text-sm text-gray-900">{acc.name}</td>
                      <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">{formatCurrency(acc.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-6 py-3 text-sm text-gray-900">Total Revenue</td>
                    <td className="px-6 py-3 text-sm text-right text-gray-900">{formatCurrency(data.totals.totalRevenue)}</td>
                  </tr>

                  {/* COGS Section */}
                  <tr className="bg-rose-50/30">
                    <td colSpan={2} className="px-6 py-2 text-xs font-bold text-rose-700 uppercase">Cost of Goods Sold</td>
                  </tr>
                  {data.categories.COGS.map((acc: ProfitLossAccount) => (
                    <tr key={acc.name}>
                      <td className="px-6 py-3 text-sm text-gray-900">{acc.name}</td>
                      <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">{formatCurrency(acc.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold text-rose-600">
                    <td className="px-6 py-3 text-sm">Total COGS</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(data.totals.totalCogs)}</td>
                  </tr>

                  <tr className="bg-indigo-50 font-bold border-y border-indigo-100">
                    <td className="px-6 py-4 text-sm text-indigo-900 uppercase tracking-wider">Gross Profit</td>
                    <td className="px-6 py-4 text-sm text-right text-indigo-900">{formatCurrency(data.totals.grossProfit)}</td>
                  </tr>

                  {/* Expenses Section */}
                  <tr className="bg-amber-50/30">
                    <td colSpan={2} className="px-6 py-2 text-xs font-bold text-amber-700 uppercase">Operating Expenses</td>
                  </tr>
                  {data.categories.EXPENSE.map((acc: ProfitLossAccount) => (
                    <tr key={acc.name}>
                      <td className="px-6 py-3 text-sm text-gray-900">{acc.name}</td>
                      <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">{formatCurrency(acc.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold text-amber-600">
                    <td className="px-6 py-3 text-sm">Total Expenses</td>
                    <td className="px-6 py-3 text-sm text-right">{formatCurrency(data.totals.totalExpenses)}</td>
                  </tr>

                  <tr className={`font-bold text-lg border-t-2 ${data.totals.netIncome >= 0 ? 'border-emerald-500 text-emerald-600' : 'border-rose-500 text-rose-600'}`}>
                    <td className="px-6 py-4">Net Income</td>
                    <td className="px-6 py-4 text-right">{formatCurrency(data.totals.netIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
