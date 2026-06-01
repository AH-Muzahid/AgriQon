'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  CreditCard, 
  Sparkles, 
  X, 
  ShieldAlert, 
  TrendingUp, 
  Check, 
  Activity,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  due: number;
  spent: number;
  points: number;
  segment: 'নিয়মিত' | 'বাকিদার' | 'নতুন';
  risk: 'কম' | 'মাঝারি' | 'উচ্চ';
  creditLimit: number;
}

interface CRMViewProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'segment' | 'risk' | 'points'>) => void;
  onCollectDue: (customerId: string, amount: number) => void;
}

export default function CRMView({
  customers,
  onAddCustomer,
  onCollectDue
}: CRMViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'সব' | 'নিয়মিত' | 'বাকিদার' | 'নতুন'>('সব');
  
  // Modals state
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [collectAmount, setCollectAmount] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCreditLimit, setNewCustCreditLimit] = useState('10000');
  const [newCustInitialDue, setNewCustInitialDue] = useState('0');

  // KPI Calculations
  const totalReceivables = customers.reduce((sum, c) => sum + c.due, 0);
  const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
  const debtorCount = customers.filter(c => c.due > 0).length;

  // Filtered List
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.includes(searchQuery) || c.phone.includes(searchQuery);
    const matchesSegment = activeSegment === 'সব' || c.segment === activeSegment;
    return matchesSearch && matchesSegment;
  });

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    const amount = parseFloat(collectAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('দয়া করে সঠিক টাকার পরিমাণ লিখুন');
      return;
    }

    if (amount > selectedCustomer.due) {
      toast.error('পরিশোধের পরিমাণ বকেয়া টাকার চেয়ে বেশি হতে পারবে না');
      return;
    }

    onCollectDue(selectedCustomer.id, amount);
    setShowCollectModal(false);
    setCollectAmount('');
    setSelectedCustomer(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      toast.error('দয়া করে নাম ও মোবাইল নাম্বার পূরণ করুন');
      return;
    }

    onAddCustomer({
      name: newCustName,
      phone: newCustPhone,
      due: parseFloat(newCustInitialDue) || 0,
      spent: 0,
      creditLimit: parseFloat(newCustCreditLimit) || 10000
    });

    setShowAddModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustCreditLimit('10000');
    setNewCustInitialDue('0');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 25 } }
  } as const;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 animate-fade-in text-[#17231f]"
    >
      {/* CRM KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'মোট বকেয়া পাওনা (Receivables)',
            value: `৳ ${totalReceivables.toLocaleString()}`,
            badge: `বাকিদার গ্রাহক: ${debtorCount} জন`,
            badgeColor: 'text-orange-700 bg-orange-50 border-orange-100',
            iconColor: 'text-orange-500 bg-orange-50/60',
            icon: CreditCard
          },
          {
            title: 'সক্রিয় লয়্যালটি পয়েন্ট (Loyalty)',
            value: `${totalPoints.toLocaleString()} পয়েন্ট`,
            badge: `রিডিমযোগ্য ভ্যালু: ৳ ${(totalPoints * 0.1).toFixed(0)}`,
            badgeColor: 'text-[#0f4f3a] bg-emerald-50 border-emerald-100',
            iconColor: 'text-[#0f4f3a] bg-emerald-50/60',
            icon: Award
          },
          {
            title: 'মোট রেজিস্টার্ড কাস্টমার',
            value: `${customers.length} জন`,
            badge: 'এই মাসে নতুন: +৫ জন',
            badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-100',
            iconColor: 'text-indigo-600 bg-indigo-50/60',
            icon: Users
          }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="bg-white p-6 rounded-3xl border border-[#eef2ef] shadow-sm flex items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-black text-[#66756e] uppercase tracking-wider block">{kpi.title}</span>
                <div className="text-2xl font-black text-[#17231f] tracking-tight">{kpi.value}</div>
                <span className={`inline-block text-[9px] font-black px-2.5 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                  {kpi.badge}
                </span>
              </div>
              <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${kpi.iconColor}`}>
                <Icon className="size-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CRM Actions & Filters */}
      <motion.div 
        variants={itemVariants}
        className="bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm space-y-6"
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-[#eef2ef]/60 pb-6">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-[#66756e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="কাস্টমারের নাম বা মোবাইল নাম্বার সার্চ করুন..."
              className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-2xl pl-11 pr-5 py-3 text-xs focus:outline-none focus:border-[#0f4f3a] focus:bg-white transition-all font-black text-[#17231f]"
            />
          </div>

          {/* Segment selection tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'সব', label: 'সব গ্রাহক' },
              { id: 'নিয়মিত', label: 'নিয়মিত' },
              { id: 'বাকিদার', label: 'বাকি বকেয়া' },
              { id: 'নতুন', label: 'নতুন কাস্টমার' }
            ].map((seg) => {
              const isActive = activeSegment === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id as any)}
                  className={`px-4.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer relative ${
                    isActive
                      ? 'text-white'
                      : 'bg-[#f4f7f5] text-[#66756e] hover:bg-[#eef2ef]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCrmSegmentBg"
                      className="absolute inset-0 bg-[#0f4f3a] rounded-2xl z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{seg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Add customer button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-[#0f4f3a] hover:bg-[#082d22] text-white text-xs font-black px-5 py-3.5 rounded-2xl transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <UserPlus className="size-4" />
            <span>নতুন গ্রাহক নিবন্ধন</span>
          </motion.button>
        </div>

        {/* Customer registry table */}
        <div className="overflow-x-auto rounded-2xl border border-[#eef2ef]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8faf9] border-b border-[#eef2ef] text-[#66756e] text-[10px] font-black uppercase tracking-wider">
                <th className="py-4 pl-5">গ্রাহকের বিবরণ (Customer)</th>
                <th className="py-4">সেগমেন্ট</th>
                <th className="py-4">মোট কেনাকাটা</th>
                <th className="py-4">বকেয়া বাকি</th>
                <th className="py-4">লয়্যালটি পয়েন্ট</th>
                <th className="py-4">ক্রেডিট লিমিট ও ঝুঁকি</th>
                <th className="py-4 text-center pr-5">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2ef] text-xs font-semibold">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-[#66756e] font-bold">
                    কোনো কাস্টমার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const limitUtilization = (cust.due / cust.creditLimit) * 100;
                  const isWarning = limitUtilization >= 80;

                  return (
                    <tr key={cust.id} className="hover:bg-[#fbfaf2]/20 transition-all">
                      <td className="py-4.5 pl-5">
                        <div>
                          <h4 className="font-black text-[#17231f] text-xs">{cust.name}</h4>
                          <p className="text-[10px] text-[#66756e] font-bold mt-1 tracking-wider">{cust.phone}</p>
                        </div>
                      </td>
                      <td className="py-4.5">
                        <span className={`inline-flex px-3 py-0.5 rounded-full text-[9px] font-black border ${
                          cust.segment === 'নিয়মিত' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          cust.segment === 'বাকিদার' ? 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {cust.segment}
                        </span>
                      </td>
                      <td className="py-4.5 font-black text-[#17231f]">৳ {cust.spent.toLocaleString()}</td>
                      <td className="py-4.5 font-black">
                        <span className={cust.due > 0 ? 'text-red-600 font-black text-sm' : 'text-[#66756e]'}>
                          ৳ {cust.due.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4.5">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black">
                          <Sparkles className="size-4 fill-emerald-50" />
                          <span>{cust.points}</span>
                        </div>
                      </td>
                      <td className="py-4.5 max-w-[150px]">
                        <div className="space-y-1.5 pr-4">
                          <div className="flex items-center justify-between text-[9px] font-bold text-[#66756e]">
                            <span>সীমা: ৳ {cust.creditLimit.toLocaleString()}</span>
                            <span>{limitUtilization.toFixed(0)}% ব্যবহৃত</span>
                          </div>
                          <div className="w-full bg-[#f4f7f5] h-2 rounded-full overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isWarning ? 'bg-red-500' : limitUtilization > 50 ? 'bg-orange-500' : 'bg-[#0f4f3a]'
                              }`}
                              style={{ width: `${Math.min(limitUtilization, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-[#66756e]">ঝুঁকি:</span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black ${
                              cust.risk === 'উচ্চ' ? 'bg-red-50 text-red-700 border border-red-100' :
                              cust.risk === 'মাঝারি' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                              'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {cust.risk} ঝুঁকি
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 text-center pr-5">
                        <motion.button
                          whileTap={cust.due > 0 ? { scale: 0.95 } : undefined}
                          disabled={cust.due === 0}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setCollectAmount(cust.due.toString());
                            setShowCollectModal(true);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                            cust.due > 0
                              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm hover:shadow'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                          }`}
                        >
                          বাকি পরিশোধ
                        </motion.button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* MODAL: COLLECT DUE AMOUNT */}
      <AnimatePresence>
        {showCollectModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-[#eef2ef] p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => {
                  setShowCollectModal(false);
                  setSelectedCustomer(null);
                }}
                className="absolute top-5 right-5 p-2 bg-[#f4f7f5] hover:bg-red-50 text-[#66756e] hover:text-red-500 rounded-full transition-all cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <h3 className="text-base font-black mb-1.5 flex items-center gap-2 text-orange-600">
                <CreditCard className="size-5" />
                <span>বাকি পরিশোধ আদায়</span>
              </h3>
              <p className="text-xs font-bold text-[#66756e] mb-4">
                গ্রাহক: <strong className="text-[#17231f]">{selectedCustomer.name}</strong> ({selectedCustomer.phone})
              </p>

              {/* Credit Risk warning if high */}
              {selectedCustomer.risk === 'উচ্চ' && (
                <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-2xl flex gap-2.5 text-red-800 text-[10px] font-bold animate-pulse">
                  <ShieldAlert className="size-4.5 shrink-0 text-red-600" />
                  <div>
                    এই কাস্টমারের ক্রেডিট লিমিট অতিক্রমের ঝুঁকি বেশি। বকেয়া আদায় দ্রুত করুন।
                  </div>
                </div>
              )}

              <form onSubmit={handleCollectSubmit} className="space-y-4 text-xs font-bold">
                <div className="bg-[#fcfdfd] border border-[#e5ebe6] p-4.5 rounded-2xl grid grid-cols-2 gap-4 mb-2 shadow-inner">
                  <div>
                    <span className="block text-[10px] text-[#66756e] font-black uppercase mb-0.5">মোট বকেয়া বকেয়া</span>
                    <span className="text-sm font-black text-red-600">৳ {selectedCustomer.due.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#66756e] font-black uppercase mb-0.5">ক্রেডিট লিমিট</span>
                    <span className="text-sm font-black text-[#17231f]">৳ {selectedCustomer.creditLimit.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-black text-[#66756e] mb-1.5">আজকে প্রাপ্ত টাকা (৳)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    max={selectedCustomer.due}
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(e.target.value)}
                    placeholder="যেমন: ১০০০"
                    className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-[#0f4f3a] text-[#17231f]"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCollectModal(false);
                      setSelectedCustomer(null);
                    }}
                    className="flex-1 py-3.5 bg-[#f4f7f5] hover:bg-[#eef2ef] text-[#66756e] text-xs font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    বাতিল করুন
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-[#0f4f3a] hover:bg-[#082d22] text-white text-xs font-bold rounded-2xl transition-all shadow-md cursor-pointer"
                  >
                    প্রাপ্তি নিশ্চিত করুন
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTER NEW CUSTOMER */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] border border-[#eef2ef] p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-5 right-5 p-2 bg-[#f4f7f5] hover:bg-red-50 text-[#66756e] hover:text-red-500 rounded-full transition-all cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <h3 className="text-base font-black mb-4 flex items-center gap-2 text-[#0f4f3a]">
                <UserPlus className="size-5.5 text-[#0f4f3a]" />
                <span>নতুন গ্রাহক নিবন্ধন</span>
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block font-black text-[#66756e] mb-1.5">গ্রাহকের পূর্ণ নাম</label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="যেমন: আল-আমিন মিয়া"
                    className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-[#0f4f3a]"
                  />
                </div>

                <div>
                  <label className="block font-black text-[#66756e] mb-1.5">মোবাইল নাম্বার</label>
                  <input
                    type="tel"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-[#0f4f3a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-[#66756e] mb-1.5">প্রারম্ভিক বকেয়া বাকি (৳)</label>
                    <input
                      type="number"
                      value={newCustInitialDue}
                      onChange={(e) => setNewCustInitialDue(e.target.value)}
                      placeholder="যেমন: ০"
                      className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-[#0f4f3a]"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-[#66756e] mb-1.5">ক্রেডিট লিমিট (৳)</label>
                    <input
                      type="number"
                      value={newCustCreditLimit}
                      onChange={(e) => setNewCustCreditLimit(e.target.value)}
                      placeholder="যেমন: ১০০০০"
                      className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-xl px-4 py-3 font-bold focus:outline-none focus:border-[#0f4f3a]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0f4f3a] hover:bg-[#082d22] text-white text-xs font-bold rounded-2xl transition-all shadow-md mt-2.5 cursor-pointer"
                >
                  নতুন গ্রাহক যুক্ত করুন
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
