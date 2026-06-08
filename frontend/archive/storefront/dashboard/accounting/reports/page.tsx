'use client';

import Link from 'next/link';
import { 
  ArrowLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  PieChart, 
  Scale,
  Calendar
} from 'lucide-react';

export default function ReportsMenu() {
  const reports = [
    {
      title: 'Profit and Loss',
      description: 'Summary of revenue, expenses, and net profit over a specific period.',
      icon: PieChart,
      href: '/dashboard/accounting/reports/profit-loss',
      tag: 'Income Statement',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Balance Sheet',
      description: 'Snapshot of assets, liabilities, and equity at a specific point in time.',
      icon: Scale,
      href: '/dashboard/accounting/reports/balance-sheet',
      tag: 'Position Statement',
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'Trial Balance',
      description: 'Listing of all ledger balances to ensure debits equal credits.',
      icon: FileSpreadsheet,
      href: '/dashboard/accounting/reports/trial-balance',
      tag: 'Integrity Check',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard/accounting" 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
              <p className="text-sm text-gray-500 mt-1">Generate and analyze your business performance</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-6">
          {reports.map((report) => (
            <Link
              key={report.title}
              href={report.href}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all duration-200"
            >
              <div className="p-8 flex items-center gap-6">
                <div className={`p-4 rounded-xl ${report.color} group-hover:scale-110 transition-transform`}>
                  <report.icon className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-gray-100 text-gray-500">
                      {report.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition">
                    {report.title}
                  </h3>
                  <p className="mt-2 text-gray-500">
                    {report.description}
                  </p>
                </div>
                <div className="text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all">
                  <ChevronRight className="w-8 h-8" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Report Settings / Period Filter Placeholder */}
        <div className="mt-12 p-8 bg-indigo-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Automated Monthly Reports
            </h2>
            <p className="text-indigo-100 max-w-lg mb-6">
              Configure automated financial summaries to be sent to stakeholders or archived for audit purposes.
            </p>
            <button className="px-6 py-2 bg-white text-indigo-900 font-semibold rounded-lg hover:bg-indigo-50 transition shadow-lg">
              Manage Automation
            </button>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-800 rounded-full blur-3xl opacity-50" />
        </div>
      </main>
    </div>
  );
}
