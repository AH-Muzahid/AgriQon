'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Database, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface IntegrityResult {
  module: string;
  checkName: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

export default function ReconciliationPage() {
  const [results, setResults] = useState<IntegrityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runReconciliation = async () => {
    setLoading(true);
    try {
      // In a real app, we'd get the current businessId from context/auth
      const businessId = 'current-business-id'; 
      const response = await apiClient.get(`/reconciliation/${businessId}`);
      if (response.success) {
        setResults(response.results);
        setLastCheck(new Date());
      }
    } catch (error) {
      console.error('Failed to run reconciliation', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'FAIL': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return null;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'PASS': return 'bg-emerald-50 border-emerald-100';
      case 'WARNING': return 'bg-amber-50 border-amber-100';
      case 'FAIL': return 'bg-rose-50 border-rose-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            Data Integrity & Reconciliation
          </h1>
          <p className="text-slate-500 mt-2">
            Automated consistency checks across Ledger, Inventory, and Accounts.
          </p>
        </div>
        
        <button 
          onClick={runReconciliation}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Running Checks...' : 'Run Full Integrity Check'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">System Health</h3>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Consistency Score</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {results.length > 0 ? (
              `${Math.round((results.filter(r => r.status === 'PASS').length / results.length) * 100)}%`
            ) : '--'}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Daily Checks</h3>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Scheduled at 1:00 AM</p>
            </div>
          </div>
          <div className="text-slate-600 font-medium">
            Active & Running
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">Last Scan</h3>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Validation History</p>
            </div>
          </div>
          <div className="text-slate-600 font-medium">
            {lastCheck ? lastCheck.toLocaleTimeString() : 'No scan yet'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Validation Results</h2>
        
        {results.length === 0 && !loading && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
            Click the button above to start a real-time data integrity scan.
          </div>
        )}

        {results.map((result, idx) => (
          <div 
            key={idx}
            className={`p-5 rounded-2xl border transition-all hover:shadow-md ${getStatusBg(result.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getStatusIcon(result.status)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500">
                      {result.module}
                    </span>
                    <h4 className="font-bold text-slate-900">{result.checkName}</h4>
                  </div>
                  <p className="text-slate-600 mt-1 text-sm">{result.message}</p>
                </div>
              </div>
              
              {result.status !== 'PASS' && (
                <button className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                  Investigate <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2 text-indigo-100 italic">Self-Healing Infrastructure</h3>
          <p className="text-indigo-200 max-w-xl">
            Our reconciliation engine doesn't just find errors—it maps data drift to specific transactions, 
            allowing for automated correction of rounding errors and minor ledger variances.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
          <ShieldCheck className="w-64 h-64" />
        </div>
      </div>
    </div>
  );
}
