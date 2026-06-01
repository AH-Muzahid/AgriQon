'use client';

import React, { useState } from 'react';
import { 
  Filter, 
  Plus, 
  Search, 
  RefreshCw, 
  ArrowLeftRight, 
  History as HistoryIcon, 
  Layers, 
  Trash2,
  TrendingUp,
  TrendingDown,
  Warehouse,
  CheckCircle,
  Truck,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  unit: string;
  price: number;
  status: 'সচল' | 'কম স্টক' | 'স্টক আউট';
  image: string;
}

interface InventoryViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setShowAddProductModal: (show: boolean) => void;
}

// Mock Movements
const mockMovements = [
  { id: 'MOV-001', product: 'আম্রপালি আম', type: 'IN', qty: 50, user: 'রহিম সওদাগর', date: 'আজ ১২:৩০ PM', remark: 'নতুন আমদানি' },
  { id: 'MOV-002', product: 'লাল টমেটো', type: 'OUT', qty: 20, user: 'POS সিস্টেম', date: 'আজ ১১:১৫ AM', remark: 'অর্ডার বিক্রি' },
  { id: 'MOV-003', product: 'দেশি ডিম', type: 'IN', qty: 100, user: 'কুদ্দুস মিয়া', date: 'গতকাল ০৫:০০ PM', remark: 'স্টক রিসিভ' },
  { id: 'MOV-004', product: 'শসা', type: 'OUT', qty: 15, user: 'POS সিস্টেম', date: 'গতকাল ০৩:২০ PM', remark: 'অর্ডার বিক্রি' }
];

// Mock Transfers
const mockTransfers = [
  { id: 'TRF-102', from: 'প্রধান গুদাম', to: 'ধানমন্ডি শাখা', product: 'আম্রপালি আম', qty: 30, status: 'সম্পন্ন', date: 'আজ ০৯:০০ AM' },
  { id: 'TRF-101', from: 'প্রধান গুদাম', to: 'উত্তরা শাখা', product: 'লাল টমেটো', qty: 50, status: 'চলমান', date: 'গতকাল ০২:৩০ PM' }
];

// Mock History
const mockHistory = [
  { id: 'HIS-091', action: 'স্টক আপডেট', desc: 'দেশি ডিম স্টক ১০ ডজন বাড়ানো হয়েছে', user: 'রহিম (অ্যাডমিন)', date: 'আজ ০২:০০ PM' },
  { id: 'HIS-090', action: 'পণ্য মুছে ফেলা', desc: 'টেস্ট ক্যাটাগরির পণ্য রিমুভ করা হয়েছে', user: 'রহিম (অ্যাডমিন)', date: 'আজ ০১:৩০ PM' },
  { id: 'HIS-089', action: 'বারকোড জেনারেট', desc: 'মিষ্টি কুমড়া পণ্যের নতুন বারকোড সিঙ্ক করা হয়েছে', user: 'সফটওয়্যার', date: 'গতকাল ০৮:০০ PM' }
];

export default function InventoryView({
  products,
  setProducts,
  setShowAddProductModal
}: InventoryViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'transfers' | 'history'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('সব');

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'সব' || p.category === categoryFilter;
    const matchesSearch = p.name.includes(searchQuery) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm space-y-6 animate-fade-in text-[#17231f]">
      
      {/* Dynamic Plan-Compliant Tabs */}
      <div className="flex border-b border-[#eef2ef] overflow-x-auto no-scrollbar gap-2">
        {[
          { id: 'overview', label: 'ওভারভিউ (Overview)', icon: Layers },
          { id: 'movements', label: 'স্টক মুভমেন্ট (Movements)', icon: RefreshCw },
          { id: 'transfers', label: 'শাখা ট্রান্সফার (Transfers)', icon: ArrowLeftRight },
          { id: 'history', label: 'ইতিহাস (History)', icon: HistoryIcon }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 border-b-2 font-black text-xs flex items-center gap-2.5 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-[#0f4f3a] text-[#0f4f3a] bg-emerald-50/30'
                  : 'border-transparent text-[#66756e] hover:text-[#17231f] hover:bg-[#f8faf9]'
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="min-h-[300px]"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Header controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-3 max-w-lg">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#66756e]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="পণ্য বা SKU দিয়ে খুঁজুন..."
                      className="w-full bg-[#f4f7f5] border border-[#eef2ef] rounded-xl pl-10 pr-4 py-2.5 text-xs font-black text-[#17231f] focus:outline-none focus:border-[#0f4f3a]"
                    />
                  </div>
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-[#eef2ef] rounded-xl px-4 py-2.5 text-xs font-black text-[#66756e] bg-[#f4f7f5] focus:outline-none focus:border-[#0f4f3a] cursor-pointer"
                  >
                    <option value="সব">সব ক্যাটাগরি</option>
                    <option value="ফল">ফল</option>
                    <option value="সবজি">সবজি</option>
                    <option value="ডিম">ডিম</option>
                  </select>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center gap-2 bg-[#0f4f3a] hover:bg-[#082d22] text-white px-5 py-3 rounded-2xl text-xs font-black shadow-sm cursor-pointer"
                >
                  <Plus className="size-4" /> <span>নতুন পণ্য যোগ করুন</span>
                </motion.button>
              </div>

              {/* Product table */}
              <div className="overflow-x-auto rounded-2xl border border-[#eef2ef]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8faf9] border-b border-[#eef2ef] text-[#66756e] text-[10px] font-black uppercase tracking-wider">
                      <th className="py-4 pl-5">পণ্য (Product)</th>
                      <th className="py-4">SKU / বারকোড</th>
                      <th className="py-4">স্টক পরিমাণ (Stock)</th>
                      <th className="py-4">দাম (৳)</th>
                      <th className="py-4">অবস্থা (Status)</th>
                      <th className="py-4 text-right pr-5">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef] text-xs font-semibold">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-[#f8faf9]/50 transition-all">
                        <td className="py-4 pl-5 flex items-center gap-3">
                          <span className="size-9 bg-[#f4f7f5] rounded-xl flex items-center justify-center text-xl shadow-inner border border-[#eef2ef]">{p.image}</span>
                          <span className="font-black text-[#17231f]">{p.name}</span>
                        </td>
                        <td className="py-4 font-mono font-bold text-gray-500">{p.sku}</td>
                        <td className="py-4 font-bold">{p.stock} {p.unit}</td>
                        <td className="py-4 font-black">৳ {p.price}</td>
                        <td className="py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                            p.status === 'সচল' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            p.status === 'কম স্টক' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-5">
                          <button
                            onClick={() => {
                              setProducts(prev => prev.filter(item => item.id !== p.id));
                              toast.success(`${p.name} রিমুভ করা হয়েছে!`);
                            }}
                            className="text-[#66756e] hover:text-red-600 font-bold p-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table pagination */}
              <div className="flex items-center justify-between border-t border-[#eef2ef] pt-5 text-xs font-bold text-[#66756e]">
                <span>মোট {filteredProducts.length}টি পণ্য দেখাচ্ছে</span>
                <div className="flex items-center gap-1.5">
                  <button className="px-3 py-2 border border-[#eef2ef] rounded-xl hover:bg-[#f4f7f5] cursor-pointer">পূর্ববর্তী</button>
                  <button className="px-3.5 py-2 bg-[#0f4f3a] text-white rounded-xl font-black">১</button>
                  <button className="px-3 py-2 border border-[#eef2ef] rounded-xl hover:bg-[#f4f7f5] cursor-pointer">পরবর্তী</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#f8faf9] rounded-2xl border border-[#eef2ef] text-xs font-bold text-[#66756e] flex items-center gap-3">
                <Info className="size-4.5 text-[#0f4f3a] shrink-0" />
                <span>স্টক ইন ও আউটের রিয়েল-টাইম ট্র্যাক রেকর্ড। POS থেকে বিক্রি হলে স্বয়ংক্রিয়ভাবে স্টক আউট মুভমেন্ট রেজিস্টার হয়।</span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-[#eef2ef]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8faf9] border-b border-[#eef2ef] text-[#66756e] text-[10px] font-black uppercase tracking-wider">
                      <th className="py-4 pl-5">মুভমেন্ট ID</th>
                      <th className="py-4">পণ্যের নাম</th>
                      <th className="py-4">ধরন (Type)</th>
                      <th className="py-4">পরিমাণ (Qty)</th>
                      <th className="py-4">ইউজার (User)</th>
                      <th className="py-4">রিমার্ক</th>
                      <th className="py-4 text-right pr-5">সময়</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef] text-xs font-semibold">
                    {mockMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-[#f8faf9]/50 transition-all">
                        <td className="py-4 pl-5 font-black text-[#0f4f3a]">{m.id}</td>
                        <td className="py-4 text-[#17231f] font-bold">{m.product}</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                            m.type === 'IN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                          }`}>
                            {m.type === 'IN' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                            {m.type === 'IN' ? 'স্টক ইন' : 'স্টক আউট'}
                          </span>
                        </td>
                        <td className="py-4 font-black">{m.qty} টি / কেজি</td>
                        <td className="py-4 text-gray-500 font-bold">{m.user}</td>
                        <td className="py-4 text-gray-500 font-bold">{m.remark}</td>
                        <td className="py-4 text-right pr-5 text-[#66756e]">{m.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#17231f]">শাখা বা আড়ত স্থানান্তর</h3>
                  <p className="text-xs text-[#66756e] font-semibold">ভিন্ন শাখা বা গুদামে পণ্য স্থানান্তরের ট্র্যাক রাখুন</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toast.success('স্থানান্তর মডিউল খুব শীঘ্রই চালু হচ্ছে!')}
                  className="flex items-center gap-2 bg-[#0f4f3a] hover:bg-[#082d22] text-white px-5 py-3 rounded-2xl text-xs font-black shadow-sm cursor-pointer"
                >
                  <Warehouse className="size-4" /> <span>নতুন স্থানান্তর করুন</span>
                </motion.button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#eef2ef]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8faf9] border-b border-[#eef2ef] text-[#66756e] text-[10px] font-black uppercase tracking-wider">
                      <th className="py-4 pl-5">ট্রান্সফার ID</th>
                      <th className="py-4">আড়ত হতে (From)</th>
                      <th className="py-4">স্থান (To)</th>
                      <th className="py-4">স্থানান্তরিত পণ্য</th>
                      <th className="py-4">পরিমাণ</th>
                      <th className="py-4">অবস্থা (Status)</th>
                      <th className="py-4 text-right pr-5">তারিখ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2ef] text-xs font-semibold">
                    {mockTransfers.map((t) => (
                      <tr key={t.id} className="hover:bg-[#f8faf9]/50 transition-all">
                        <td className="py-4 pl-5 font-black text-gray-500">{t.id}</td>
                        <td className="py-4 text-[#17231f] font-bold">{t.from}</td>
                        <td className="py-4 text-[#17231f] font-bold">{t.to}</td>
                        <td className="py-4 text-[#0f4f3a] font-bold">{t.product}</td>
                        <td className="py-4 font-black">{t.qty} কেজি</td>
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                            t.status === 'সম্পন্ন' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-blue-50 text-blue-700 border-blue-100 animate-pulse'
                          }`}>
                            {t.status === 'সম্পন্ন' ? <CheckCircle className="size-3" /> : <Truck className="size-3 animate-bounce" />}
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-5 text-[#66756e]">{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="p-4 bg-[#f8faf9] rounded-2xl border border-[#eef2ef] text-xs font-bold text-[#66756e] flex items-center gap-3">
                <HistoryIcon className="size-4.5 text-[#0f4f3a] shrink-0" />
                <span>ম্যানেজার কর্তৃক ইনভেন্টরি তথ্যের যেকোনো প্রকার পরিবর্তনের সম্পূর্ণ অডিট ট্রেইল।</span>
              </div>

              <div className="relative border-l border-[#eef2ef] ml-5 pl-8 space-y-8">
                {mockHistory.map((h, idx) => (
                  <div key={h.id} className="relative">
                    {/* Timeline bullet dot */}
                    <span className="absolute -left-12.5 top-1.5 size-9 bg-white border border-[#eef2ef] hover:border-[#0f4f3a] rounded-full flex items-center justify-center text-xs shadow-sm text-[#0f4f3a]">
                      📌
                    </span>
                    <div className="bg-[#fcfdfd] border border-[#eef2ef] p-5 rounded-3xl max-w-2xl space-y-2.5 hover:shadow-md transition-all">
                      <div className="flex items-center justify-between gap-3 text-[10px] font-black text-[#66756e]">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                          {h.action}
                        </span>
                        <span>{h.date}</span>
                      </div>
                      <h4 className="text-xs font-black text-[#17231f]">{h.desc}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-[#66756e] font-bold pt-1.5 border-t border-[#eef2ef]/60">
                        <span>সম্পাদনকারী:</span>
                        <span className="text-[#17231f]">{h.user}</span>
                        <span className="text-gray-300">|</span>
                        <span>ID: {h.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
