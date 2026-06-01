'use client';

import React from 'react';
import { Star } from 'lucide-react';

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
  rating?: number;
}

interface MarketplaceViewProps {
  products: Product[];
  addToCart: (product: Product) => void;
}

export default function MarketplaceView({ products, addToCart }: MarketplaceViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in bg-white p-6 rounded-3xl border border-[#eef2ef] shadow-sm text-[#17231f]">
      {/* Dynamic Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#0f4f3a] text-white p-8 flex flex-col md:flex-row items-center justify-between">
        <div className="space-y-4 text-center md:text-left z-10">
          <span className="text-[10px] uppercase bg-emerald-400/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-500/20">
            ১০০% অর্গানিক ও ফ্রেশ
          </span>
          <h2 className="text-2xl font-black md:text-3xl">তাজা ও অর্গানিক খাবার<br />সরাসরি খামার থেকে</h2>
          <button
            onClick={() => {
              alert('মার্কেটপ্লেস কার্ট সক্রিয় করা হয়েছে!');
            }}
            className="px-6 py-2.5 bg-[#f2c94c] hover:bg-[#c99516] text-[#0f4f3a] text-xs font-black rounded-xl transition-all shadow-md active:scale-95"
          >
            এখনি অর্ডার করুন
          </button>
        </div>
        <div className="text-7xl select-none md:mr-6 mt-6 md:mt-0 opacity-85">
          🥦🌾🥭
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h3 className="text-sm font-black mb-4">ক্যাটাগরি সমূহ</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'ফ্রেশ পণ্য', emoji: '🥬', count: '২৫ টি' },
            { label: 'অর্গানিক', emoji: '🍅', count: '১২ টি' },
            { label: 'প্রিয় বিক্রেতা', emoji: '🏡', count: '৮ টি' },
            { label: 'দ্রুত ডেলিভারি', emoji: '🚚', count: '২ ঘ' }
          ].map((cat, idx) => (
            <div key={idx} className="p-4 border border-[#e5ebe6] rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#0f4f3a] hover:bg-[#f4f7f5] transition-all bg-[#fbfaf2]/20">
              <span className="text-2xl mb-1">{cat.emoji}</span>
              <span className="text-xs font-black text-[#17231f]">{cat.label}</span>
              <span className="text-[10px] font-bold text-[#66756e]">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product showcase */}
      <div>
        <h3 className="text-sm font-black mb-4">জনপ্রিয় পণ্য</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="border border-[#e5ebe6] hover:border-[#0f4f3a] rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <span className="text-3xl bg-gray-50 p-2.5 rounded-xl">{p.image}</span>
                <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-[10px]">
                  <Star className="size-3 fill-amber-500" />
                  <span>{p.rating || 4.5}</span>
                </div>
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-black truncate">{p.name}</h4>
                <p className="text-[10px] font-bold text-[#66756e] mt-0.5">৳ {p.price} / {p.unit}</p>
              </div>
              <button
                onClick={() => {
                  addToCart(p);
                }}
                className="mt-4 w-full py-2 bg-[#f4f7f5] hover:bg-[#e8f3ec] text-[#0f4f3a] text-xs font-bold rounded-xl border border-[#e5ebe6] hover:border-[#d3ebd8] transition-all animate-pulse"
              >
                কার্টে যোগ
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
