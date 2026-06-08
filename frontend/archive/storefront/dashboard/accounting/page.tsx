'use client';

import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { 
  BarChart3, 
  History, 
  PlusCircle, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  PieChart,
  Calculator
} from 'lucide-react';

export default function AccountingDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  const quickStats = [
    { name: 'Total Revenue', value: 'AED 125,430.00', change: '+12.5%', type: 'up', icon: ArrowUpRight },
    { name: 'Accounts Receivable', value: 'AED 42,100.00', change: '+5.2%', type: 'up', icon: DollarSign },
    { name: 'Operating Expenses', value: 'AED 18,920.00', change: '-2.4%', type: 'down', icon: ArrowDownLeft },
    { name: 'Net Profit Margin', value: '24.8%', change: '+1.2%', type: 'up', icon: PieChart },
  ];

  const modules = [
    {
      title: 'Financial Reports',
      description: 'Generate Profit & Loss, Balance Sheet, and Trial Balance.',
      icon: BarChart3,
      href: '/dashboard/accounting/reports',
      color: 'bg-indigo-500',
    },
    {
      title: 'General Ledger',
      description: 'View and audit all journal entries and account activity.',
      icon: History,
      href: '/dashboard/accounting/ledger',
      color: 'bg-emerald-500',
    },
    {
      title: 'Chart of Accounts',
      description: 'Manage your financial accounts and organizational structure.',
      icon: Wallet,
      href: '/dashboard/accounting/accounts',
      color: 'bg-amber-500',
    },
    {
      title: 'Journal Entry',
      description: 'Record manual adjustments or non-operational transactions.',
      icon: PlusCircle,
      href: '/dashboard/accounting/transactions/new',
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calculator className="w-8 h-8 text-indigo-600" />
                Financial Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">Real-time ledger visibility and reporting</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/dashboard/accounting/transactions/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Entry
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {quickStats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <stat.icon className="w-5 h-5 text-gray-600" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.type === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Modules Grid */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Core Modules</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {modules.map((module) => (
            <Link
              key={module.title}
              href={module.href}
              className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-5">
                <div className={`p-4 rounded-xl ${module.color} text-white shadow-lg`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                    {module.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {module.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-semibold text-indigo-600">
                    Access Module <ArrowUpRight className="ml-1 w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Ledger Activity</h2>
            <Link href="/dashboard/accounting/ledger" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all
            </Link>
          </div>
          <div className="bg-white shadow rounded-xl border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Oct {14-i}, 2023</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Order Revenue #ORD-2023-00{i}</div>
                      <div className="text-xs text-gray-500">Sales Income Account</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        POSTED
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      AED {(5420.50 * i).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
