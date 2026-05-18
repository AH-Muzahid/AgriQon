"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, TrendingUp, History, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface SmartSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const recentSearches = ["Organic Avocados", "Fresh Berries", "Camel Milk", "Local Dates"];
const trendingSearches = ["Hydroponic Lettuce", "A2 Ghee", "Saffron Honey", "Desert Kale"];

export function SmartSearch({ isOpen, onClose }: SmartSearchProps) {
  const [query, setQuery] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0a4d3c]/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 inset-x-4 md:top-8 md:max-w-3xl md:mx-auto bg-white rounded-[2.5rem] shadow-2xl z-[101] overflow-hidden border border-gray-100"
          >
            <div className="p-6 md:p-8">
              <form onSubmit={handleSearch} className="relative group mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-gray-400 group-focus-within:text-[#0a4d3c] transition-colors" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                  }}
                  placeholder="Ask for anything... 'low sugar fruits' or 'salad recipes'"
                  className="w-full h-16 pl-16 pr-24 bg-gray-50 border-transparent rounded-2xl text-xl font-medium focus-visible:ring-[#0a4d3c] focus:bg-white focus:border-gray-100 transition-all shadow-inner"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  {query && (
                    <button 
                      type="button"
                      onClick={() => setQuery("")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="size-5 text-gray-400" />
                    </button>
                  )}
                  <button 
                    type="submit"
                    className="p-3 bg-[#0a4d3c] text-[#facc15] rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                  >
                    <ArrowRight className="size-5" />
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* AI Features */}
                <div>
                   <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="size-4 text-[#facc15]" />
                      <span className="text-xs font-black uppercase tracking-widest text-[#0a4d3c]">AI Suggestions</span>
                   </div>
                   <div className="space-y-4">
                      {trendingSearches.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuery(item);
                            router.push(`/shop?q=${encodeURIComponent(item)}`);
                            onClose();
                          }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-emerald-100 hover:bg-emerald-50 transition-all group"
                        >
                           <div className="flex items-center gap-4">
                              <TrendingUp className="size-4 text-emerald-400" />
                              <span className="text-sm font-bold text-gray-700">{item}</span>
                           </div>
                           <ArrowRight className="size-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                   </div>
                </div>

                {/* History */}
                <div>
                   <div className="flex items-center gap-2 mb-6">
                      <History className="size-4 text-gray-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-gray-400">Recent Searches</span>
                   </div>
                   <div className="flex flex-wrap gap-3">
                      {recentSearches.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuery(item);
                            router.push(`/shop?q=${encodeURIComponent(item)}`);
                            onClose();
                          }}
                          className="px-4 py-2 rounded-xl bg-gray-50 text-xs font-bold text-gray-500 hover:bg-[#0a4d3c] hover:text-white transition-all"
                        >
                          {item}
                        </button>
                      ))}
                   </div>

                   <div className="mt-12 p-6 rounded-[2rem] bg-[#0a4d3c] text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#facc15] mb-2">New Update</p>
                        <h4 className="text-lg font-black leading-tight mb-2">Semantic AI Search</h4>
                        <p className="text-xs text-white/60 leading-relaxed">
                          Try searching for benefits like &quot;high protein&quot; or &quot;gut health&quot; to see our discovery engine in action.
                        </p>
                      </div>
                      <Sparkles className="absolute -bottom-4 -right-4 size-24 text-white/5 rotate-12" />
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">AgriQon Intelligence v2.1.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
