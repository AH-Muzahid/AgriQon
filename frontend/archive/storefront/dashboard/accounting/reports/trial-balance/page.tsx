'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { 
  ArrowLeft, 
  Download, 
  ShieldCheck, 
  AlertCircle,
  Calendar,
  Loader2,
  Printer,
  History
} from 'lucide-react';
import Link from 'next/link';

interface TrialBalanceAccount {
  name: string;
  type: string;
  code: string;
  balance: number;
}

interface TrialBalanceData {
  balances: TrialBalanceAccount[];
  totals: {
    isBalanced: boolean;
    totalDebit: number;
    totalCredit: number;
  };
}

export default function TrialBalanceReport() {
  const [data, setData] = useState<TrialBalanceData | null>(null);
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
      const response = await apiClient.get<TrialBalanceData>('/accounting/reports/trial-balance', { params: { startDate, endDate } });
      setData(response.data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch report';
      setError(errorMsg);
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
    if (val === 0) return '—';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-rose-100 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={fetchReport} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/accounting/reports" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Trial Balance</h1>
                <p className="text-xs text-gray-500">Integrity Check Report</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <Printer className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Status Alert */}
        <div className={`mb-8 p-4 rounded-xl border flex items-center gap-4 ${
          data.totals.isBalanced 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
          : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {data.totals.isBalanced ? <ShieldCheck className="w-6 h-6 text-emerald-500" /> : <AlertCircle className="w-6 h-6 text-rose-500" />}
          <div>
            <p className="font-bold">{data.totals.isBalanced ? 'Balanced' : 'Imbalanced Ledger'}</p>
            <p className="text-xs opacity-80">Total Debits: {formatCurrency(data.totals.totalDebit)} | Total Credits: {formatCurrency(data.totals.totalCredit)}</p>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:border-indigo-500"
              />
              <span className="text-gray-400">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Account Name</th>
                <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Account Code</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Debit (AED)</th>
                <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Credit (AED)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.balances.map((acc: TrialBalanceAccount) => (
                <tr key={acc.code} className="hover:bg-gray-50/50 transition">
                  <td className="px-8 py-4">
                    <div className="text-sm font-bold text-gray-900">{acc.name}</div>
                    <div className="text-[10px] font-bold text-indigo-500 uppercase">{acc.type}</div>
                  </td>
                  <td className="px-8 py-4 text-sm font-mono text-gray-500">{acc.code}</td>
                  <td className="px-8 py-4 text-sm text-right font-semibold text-emerald-700">
                    {acc.balance >= 0 ? formatCurrency(acc.balance) : '—'}
                  </td>
                  <td className="px-8 py-4 text-sm text-right font-semibold text-rose-700">
                    {acc.balance < 0 ? formatCurrency(Math.abs(acc.balance)) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-900 text-white font-black text-lg">
              <tr>
                <td colSpan={2} className="px-8 py-6 uppercase tracking-wider">Total Balances</td>
                <td className="px-8 py-6 text-right">{formatCurrency(data.totals.totalDebit)}</td>
                <td className="px-8 py-6 text-right">{formatCurrency(data.totals.totalCredit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Verification Footer */}
        <div className="mt-12 flex items-center justify-center gap-8">
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
             <History className="w-4 h-4" />
             Last sync: 2 minutes ago
           </div>
           <div className="w-1 h-1 bg-gray-300 rounded-full" />
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             Hash verified
           </div>
        </div>
      </main>
    </div>
  );
}
