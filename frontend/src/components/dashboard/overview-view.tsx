'use client';

import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Plus,
  Bot,
  TrendingUp,
  ArrowUpRight,
  AlertTriangle,
  Wallet,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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

interface Order {
  id: string;
  customer: string;
  amount: number;
  status: 'ডেলিভারি' | 'প্রসেসিং' | 'পেন্ডিং';
  time: string;
}

interface OverviewViewProps {
  products: Product[];
  orders: Order[];
  todaySales: number;
  todayProfit: number;
  totalOrders: number;
  lowStockCount: number;
  dueAmount: number;
  setActiveTab: (tab: 'home' | 'pos' | 'products' | 'customers' | 'reports' | 'assistant' | 'consumer') => void;
  setShowAddProductModal: (show: boolean) => void;
}

const chartData = [
  { name: 'সোম', sales: 4000 },
  { name: 'মঙ্গল', sales: 7500 },
  { name: 'বুধ', sales: 6200 },
  { name: 'বৃহ', sales: 9000 },
  { name: 'শুক্র', sales: 7100 },
  { name: 'শনি', sales: 11000 },
  { name: 'রবি', sales: 12450 }
];

export default function OverviewView({
  products,
  orders,
  todaySales,
  todayProfit,
  totalOrders,
  lowStockCount,
  dueAmount,
  setActiveTab,
  setShowAddProductModal
}: OverviewViewProps) {
  // Animation container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
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
      {/* Premium AI Conversational Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative bg-gradient-to-r from-[#0f4f3a] to-[#126b4f] rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-[0_12px_30px_rgba(15,79,58,0.15)]"
      >
        <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-white/5 blur-2xl"></div>
        <div className="absolute right-20 top-2 size-36 rounded-full bg-[#1bb886]/10 blur-xl"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#1bb886]">
              <Bot className="size-4 text-[#1bb886]" />
              <span>AgriQon AI সারসংক্ষেপ</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black font-heading tracking-tight leading-tight">
              আসসালামু আলাইকুম রহিম ভাই! আপনার খামার আজ দারুণ চলছে।
            </h1>
            <p className="text-sm text-white/80 max-w-xl font-medium">
              আজকে আপনার মোট বিক্রি হয়েছে <span className="font-extrabold text-white text-base">৳ {todaySales.toLocaleString()}</span>। বর্তমানে <span className="text-[#ffd700] font-extrabold">{lowStockCount}টি পণ্য কম স্টক</span> অবস্থায় আছে, যা দ্রুত আপডেট করা প্রয়োজন।
            </p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab('assistant')}
            className="self-start md:self-center bg-white text-[#0f4f3a] hover:bg-emerald-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>AI অ্যাসিস্ট্যান্টকে জিজ্ঞাসা করুন</span>
            <ArrowUpRight className="size-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* STATS KPIs */}
      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
      >
        {[
          { 
            title: 'আজকের বিক্রি', 
            value: `৳ ${todaySales.toLocaleString()}`, 
            delta: 'গতকালের চেয়ে +১২.৫%', 
            isPositive: true,
            color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-700',
            icon: TrendingUp
          },
          { 
            title: 'আজকের লাভ', 
            value: `৳ ${todayProfit.toLocaleString()}`, 
            delta: 'গতকালের চেয়ে +৮.৩%', 
            isPositive: true,
            color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-700',
            icon: ArrowUpRight
          },
          { 
            title: 'মোট অর্ডার', 
            value: totalOrders, 
            delta: 'গতকালের চেয়ে +১৪.২%', 
            isPositive: true,
            color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-700',
            icon: ShoppingCart
          },
          { 
            title: 'কম স্টক পণ্য', 
            value: lowStockCount, 
            delta: 'মোট পণ্যের ৫%', 
            isPositive: false,
            color: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-700',
            icon: AlertTriangle
          },
          { 
            title: 'বাকি টাকা', 
            value: `৳ ${dueAmount.toLocaleString()}`, 
            delta: '১৮ জন গ্রাহক', 
            isPositive: false,
            color: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-700',
            icon: Wallet
          }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              className="bg-white rounded-2xl border border-[#eef2ef] p-5 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-black text-[#66756e] uppercase tracking-wider">{stat.title}</span>
                <span className={`p-2 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shrink-0`}>
                  <Icon className="size-4" />
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <div className="text-2xl font-black text-[#17231f] tracking-tight">{stat.value}</div>
                <div className={`inline-flex text-[9px] px-2.5 py-0.5 rounded-full font-black ${
                  stat.isPositive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                  stat.title === 'কম স্টক পণ্য' ? 'bg-red-50 text-red-700 border border-red-100' :
                  'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {stat.delta}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* GRAPH & TOP SELLING PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm flex flex-col justify-between gap-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#17231f]">বিক্রির সারসংক্ষেপ</h3>
              <p className="text-xs text-[#66756e] font-semibold">সাপ্তাহিক রিয়েল-টাইম রিপোর্ট</p>
            </div>
            <select className="border border-[#eef2ef] rounded-xl px-4 py-2 text-xs font-bold text-[#66756e] focus:outline-none focus:border-[#0f4f3a]">
              <option>এই সপ্তাহ</option>
              <option>এই মাস</option>
            </select>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f4f3a" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#0f4f3a" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f3f1" />
                <XAxis dataKey="name" stroke="#66756e" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#66756e" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid #eef2ef', 
                    fontSize: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                    padding: '8px 12px' 
                  }} 
                />
                <Area type="monotone" dataKey="sales" stroke="#0f4f3a" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Selling Products Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm flex flex-col justify-between"
        >
          <div className="space-y-1 mb-6">
            <h3 className="text-base font-black text-[#17231f]">সবচেয়ে বেশি বিক্রি হওয়া পণ্য</h3>
            <p className="text-xs text-[#66756e] font-semibold">চলতি সপ্তাহে সর্বোচ্চ বিক্রিত</p>
          </div>
          <div className="space-y-4">
            {products.slice(0, 4).map((p, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#f8faf9] transition-all border border-transparent hover:border-[#eef2ef]"
              >
                <div className="flex items-center gap-3.5">
                  <span className="size-11 bg-gradient-to-br from-[#f4f7f5] to-[#e8f3ec] rounded-xl flex items-center justify-center text-xl shadow-inner">{p.image}</span>
                  <div>
                    <h4 className="text-xs font-black text-[#17231f]">{p.name}</h4>
                    <p className="text-[10px] font-bold text-[#66756e] mt-0.5">১১০ {p.unit} বিক্রি</p>
                  </div>
                </div>
                <span className="text-sm font-black text-[#0f4f3a]">৳ {((p.price * 80) || 3000).toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* RECENT ORDERS & STOCK WARNINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders table */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-black text-[#17231f]">সাম্প্রতিক অর্ডার</h3>
            <button className="text-xs font-bold text-[#0f4f3a] hover:underline cursor-pointer">সব দেখুন</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#eef2ef] text-[#66756e] text-[11px] font-black uppercase tracking-wider">
                  <th className="pb-3.5">অর্ডার আইডি</th>
                  <th className="pb-3.5">গ্রাহক</th>
                  <th className="pb-3.5">মূল্য</th>
                  <th className="pb-3.5">অবস্থা</th>
                  <th className="pb-3.5 text-right">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef2ef] text-xs font-semibold">
                {orders.map((order, idx) => (
                  <tr key={idx} className="hover:bg-[#f8faf9]/60 transition-all">
                    <td className="py-4 font-black text-[#0f4f3a]">{order.id}</td>
                    <td className="py-4 text-[#17231f] font-bold">{order.customer}</td>
                    <td className="py-4 font-black text-[#17231f]">৳ {order.amount.toLocaleString()}</td>
                    <td className="py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black border ${
                        order.status === 'ডেলিভারি' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        order.status === 'প্রসেসিং' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-[#66756e] font-bold">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Low Stock Alerts & Quick Actions */}
        <div className="space-y-8">
          {/* Low Stock List */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black text-[#17231f]">কম স্টক পণ্য</h3>
              <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-[#0f4f3a] hover:underline cursor-pointer">সব দেখুন</button>
            </div>
            
            <div className="space-y-3.5">
              {products.filter(p => p.stock < 10).map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-red-50/40 border border-red-100/60">
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{p.image}</span>
                    <div>
                      <h4 className="text-xs font-black text-[#17231f]">{p.name}</h4>
                      <p className="text-[10px] font-bold text-red-600 mt-0.5">স্টক: {p.stock} {p.unit}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-200">
                    ক্রিটিক্যাল
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div 
            variants={itemVariants}
            className="bg-white p-6 md:p-8 rounded-3xl border border-[#eef2ef] shadow-sm"
          >
            <h3 className="text-base font-black text-[#17231f] mb-6">দ্রুত কার্যক্রম</h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('pos')}
                className="p-4 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-xs font-bold border border-emerald-100/60 cursor-pointer shadow-sm"
              >
                <ShoppingCart className="size-5.5 text-[#0f4f3a]" />
                <span>নতুন POS বিক্রি</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddProductModal(true)}
                className="p-4 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-xs font-bold border border-indigo-100/60 cursor-pointer shadow-sm"
              >
                <Plus className="size-5.5 text-indigo-600" />
                <span>পণ্য যোগ করুন</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  alert('স্টক সফলভাবে সিঙ্ক হয়েছে!');
                }}
                className="p-4 bg-teal-50 hover:bg-teal-100/80 text-teal-800 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-xs font-bold border border-teal-100/60 cursor-pointer shadow-sm"
              >
                <Package className="size-5.5 text-teal-600" />
                <span>স্টক সিঙ্ক</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab('assistant')}
                className="p-4 bg-[#e8f3ec] hover:bg-[#d8e8dc] text-[#0f4f3a] rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-xs font-bold border border-[#d3ebd8] cursor-pointer shadow-sm"
              >
                <Bot className="size-5.5 text-[#0f4f3a]" />
                <span>AI অ্যাসিস্ট্যান্ট</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
