'use client';

import React from 'react';
import { Bell, LayoutDashboard, Package, ShoppingCart, Bot, ShoppingBag } from 'lucide-react';

interface MobilePreviewFrameProps {
  activeUser: {
    name: string;
    role: string;
    email: string;
    avatarUrl?: string | null;
  };
  todaySales: number;
  todayProfit: number;
  totalOrders: number;
  lowStockCount: number;
  dueAmount: number;
  activeTab: 'home' | 'pos' | 'products' | 'assistant' | 'consumer';
  setActiveTab: (tab: 'home' | 'pos' | 'products' | 'assistant' | 'consumer') => void;
  setShowAddProductModal: (show: boolean) => void;
}

export default function MobilePreviewFrame({
  activeUser,
  todaySales,
  todayProfit,
  totalOrders,
  lowStockCount,
  dueAmount,
  activeTab,
  setActiveTab,
  setShowAddProductModal
}: MobilePreviewFrameProps) {
  return (
    <div className="w-full min-h-screen bg-[#f4f7f5] flex flex-col justify-between text-xs relative select-none text-[#17231f] lg:max-w-md lg:mx-auto lg:my-6 lg:rounded-3xl lg:shadow-2xl lg:border lg:border-[#e5ebe6] lg:overflow-hidden">
      {/* Top navigation */}
      <div className="bg-white px-5 py-3 border-b border-[#eef2ef] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">🌾</span>
          <span className="font-black text-[#0f4f3a] text-sm">AgriQon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="size-4 text-[#0f4f3a]" />
            <span className="absolute -top-1 -right-1 size-3 bg-red-500 text-[8px] font-black text-white flex items-center justify-center rounded-full">
              12
            </span>
          </div>
          <span className="size-6 bg-[#0f4f3a] text-white rounded-full flex items-center justify-center font-extrabold text-[10px]">R</span>
        </div>
      </div>

      {/* Screen Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-20">
        {/* Title segment */}
        <div>
          <h3 className="text-base font-black">আজকের সারসংক্ষেপ</h3>
          <p className="text-[10px] font-bold text-[#66756e]">২১ মে, ২০২৬</p>
        </div>

        {/* Vertical mini cards grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-[#eef2ef] shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-[#66756e]">আজকের বিক্রি</span>
            <span className="text-sm font-black mt-1">৳ {todaySales.toLocaleString()}</span>
            <span className="text-[9px] text-emerald-600 font-bold mt-1">+১২.৫%</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#eef2ef] shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-[#66756e]">আজকের লাভ</span>
            <span className="text-sm font-black mt-1">৳ {todayProfit.toLocaleString()}</span>
            <span className="text-[9px] text-emerald-600 font-bold mt-1">+৮.৩%</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#eef2ef] shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-[#66756e]">মোট অর্ডার</span>
            <span className="text-sm font-black mt-1">{totalOrders}</span>
            <span className="text-[9px] text-emerald-600 font-bold mt-1">+১৪.২%</span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-[#eef2ef] shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-black text-red-600">কম স্টক</span>
            <span className="text-sm font-black mt-1 text-red-600">{lowStockCount} টি</span>
            <span className="text-[9px] text-[#66756e] font-bold mt-1">মোট ৫%</span>
          </div>
        </div>

        {/* Remaining due amount box */}
        <div className="bg-white p-4 rounded-xl border border-[#eef2ef] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-[#66756e]">বাকি টাকা</span>
            <h4 className="text-sm font-black mt-0.5">৳ {dueAmount.toLocaleString()}</h4>
          </div>
          <span className="text-[9px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
            ১৮ জন গ্রাহক
          </span>
        </div>

        {/* Micro action shortcuts */}
        <div>
          <h4 className="text-xs font-black mb-3">দ্রুত কার্যক্রম</h4>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
            {[
              { label: 'নতুন বিক্রি', emoji: '🍎', action: () => setActiveTab('pos') },
              { label: 'পণ্য যোগ', emoji: '➕', action: () => setShowAddProductModal(true) },
              { label: 'স্টক আপডেট', emoji: '📦', action: () => alert('স্টক আপডেট সক্রিয় করা হয়েছে!') },
              { label: 'অর্ডার', emoji: '📑' },
              { label: 'ইনভয়েস', emoji: '🧾' },
              { label: 'রিপোর্ট', emoji: '📊' }
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={item.action}
                className="bg-white p-3 rounded-xl border border-[#eef2ef] shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-[#f4f7f5] transition-all"
              >
                <span className="text-xl mb-1">{item.emoji}</span>
                <span className="truncate w-full">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice bot box wrapper */}
        <div
          onClick={() => {
            setActiveTab('assistant');
          }}
          className="p-4 bg-emerald-950 text-white rounded-2xl flex items-center gap-3 cursor-pointer shadow-md hover:bg-emerald-900 transition-all"
        >
          <span className="text-2xl">🤖</span>
          <div>
            <h4 className="font-black text-xs">রহিম ভাই, আমি আপনার এআই সহকারী</h4>
            <p className="text-[9px] text-emerald-300 font-bold mt-0.5">প্রশ্ন করতে এখানে ট্যাপ করুন</p>
          </div>
        </div>
      </div>

      {/* Bottom simulated navigation tabs */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-[#eef2ef] flex items-center justify-around z-40 px-3">
        {[
          { id: 'home', label: 'হোম', icon: LayoutDashboard },
          { id: 'products', label: 'পণ্য', icon: Package },
          { id: 'pos', label: 'POS', icon: ShoppingCart },
          { id: 'assistant', label: 'AI অ্যাসিস্ট', icon: Bot },
          { id: 'consumer', label: 'মার্কেট', icon: ShoppingBag }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
              }}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive ? 'text-[#0f4f3a]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="size-4" />
              <span className="text-[9px] font-black">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
