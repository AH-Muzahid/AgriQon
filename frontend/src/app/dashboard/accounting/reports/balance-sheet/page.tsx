'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { 
  ArrowLeft, 
  Download, 
  Scale, 
  ShieldCheck, 
  AlertCircle,
  Calendar,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface BalanceSheetData {
  asOfDate: string;
  categories: {
    ASSETS: { name: string; balance: number }[];
    LIABILITIES: { name: string; balance: number }[];
    EQUITY: { name: string; balance: number }[];
  };
  totals: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
  };
}

export default function BalanceSheetReport() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = useCallback(async () => {
    // Defer execution to avoid synchronous setState in effect
    await Promise.resolve();
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<BalanceSheetData>('/accounting/reports/balance-sheet', { params: { date } });
      setData(response.data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch report';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [date]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-rose-100 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to load report</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button onClick={fetchReport} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/accounting/reports" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Balance Sheet</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  As of {new Date(date).toLocaleDateString('en-AE', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Verification Alert */}
        {data.totals.isBalanced ? (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
            <div className="text-sm">
              <span className="font-bold">Ledger Integrity Verified.</span> Assets match Liabilities and Equity. The balance sheet is perfectly balanced.
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700 shadow-sm animate-pulse">
            <AlertCircle className="w-6 h-6" />
            <div className="text-sm">
              <span className="font-bold">Balance Mismatch Detected.</span> Assets do not match Liabilities and Equity. Please audit your ledger entries.
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Statement Date</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-none p-0 text-gray-900 font-semibold focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
          <div className="text-right">
             <span className="text-xs text-gray-400 block mb-1">Currency</span>
             <span className="font-bold text-gray-900">AED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* ASSETS */}
          <section>
            <div className="flex items-center justify-between border-b-2 border-gray-900 pb-2 mb-4">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Assets</h2>
              <span className="text-xs font-bold text-gray-500 uppercase">Current Value</span>
            </div>
            <div className="space-y-1">
              {data.categories.ASSETS.map((asset) => (
                <div key={asset.name} className="flex justify-between py-2 border-b border-gray-50 group hover:bg-gray-50/50 px-2 rounded-lg transition">
                  <span className="text-sm text-gray-600">{asset.name}</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(asset.balance)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900 uppercase">Total Assets</span>
              <span className="text-xl font-black text-gray-900">{formatCurrency(data.totals.totalAssets)}</span>
            </div>
          </section>

          {/* LIABILITIES & EQUITY */}
          <div className="space-y-10">
            <section>
              <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-2 mb-4">
                <h2 className="text-lg font-bold text-indigo-900 uppercase tracking-wider">Liabilities</h2>
                <span className="text-xs font-bold text-indigo-400 uppercase">Amount</span>
              </div>
              <div className="space-y-1">
                {data.categories.LIABILITIES.map((liab) => (
                  <div key={liab.name} className="flex justify-between py-2 border-b border-gray-50 group hover:bg-gray-50/50 px-2 rounded-lg transition">
                    <span className="text-sm text-gray-600">{liab.name}</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(liab.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-baseline px-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Total Liabilities</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(data.totals.totalLiabilities)}</span>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-2 mb-4">
                <h2 className="text-lg font-bold text-emerald-900 uppercase tracking-wider">Equity</h2>
                <span className="text-xs font-bold text-emerald-400 uppercase">Value</span>
              </div>
              <div className="space-y-1">
                {data.categories.EQUITY.map((eq) => (
                  <div key={eq.name} className="flex justify-between py-2 border-b border-gray-50 group hover:bg-gray-50/50 px-2 rounded-lg transition">
                    <span className="text-sm text-gray-600">{eq.name}</span>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(eq.balance)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-baseline px-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Total Equity</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(data.totals.totalEquity)}</span>
              </div>
            </section>

            <div className={`mt-8 p-6 rounded-2xl border-2 flex justify-between items-center ${data.totals.isBalanced ? 'bg-indigo-900 border-indigo-700 text-white' : 'bg-rose-900 border-rose-700 text-white'}`}>
              <div>
                <span className="text-xs font-bold opacity-70 uppercase tracking-widest">Total Liabilities & Equity</span>
                <div className="text-2xl font-black">{formatCurrency(data.totals.totalLiabilitiesAndEquity)}</div>
              </div>
              {data.totals.isBalanced && <Scale className="w-10 h-10 opacity-20" />}
            </div>
          </div>
        </div>

        {/* Audit Footer */}
        <div className="mt-16 border-t border-gray-200 pt-10 text-center">
          <p className="text-xs text-gray-400 max-w-lg mx-auto leading-relaxed">
            This balance sheet is generated directly from the AgriQon hardened ledger. 
            All entries are immutable once posted. For detailed audit trails, visit the General Ledger module.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/dashboard/accounting/ledger" className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700">
              Audit Ledger <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
