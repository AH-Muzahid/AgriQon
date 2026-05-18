"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
}

const CATEGORY_MAP: Record<string, { emoji: string; bgColor: string }> = {
  "Vegetables": { emoji: "🍅", bgColor: "bg-[#fce5df]" },
  "Fruits": { emoji: "🍏", bgColor: "bg-[#b6edd6]" },
  "Drinks": { emoji: "🍹", bgColor: "bg-[#d8a43f]" },
  "Meat": { emoji: "🥩", bgColor: "bg-[#b4ddf5]" },
  "Bakery": { emoji: "🍞", bgColor: "bg-[#fadd92]" },
  "Eggs": { emoji: "🥚", bgColor: "bg-[#d4e5c8]" },
  "Sea Food": { emoji: "🐟", bgColor: "bg-[#97cbeb]" },
  "Snacks": { emoji: "🍿", bgColor: "bg-[#fce5df]" },
  "Dairy": { emoji: "🧀", bgColor: "bg-[#fadd92]" },
  "Frozen": { emoji: "🍦", bgColor: "bg-[#b4ddf5]" },
  "Organic": { emoji: "🌿", bgColor: "bg-[#d4e5c8]" },
  "Grains": { emoji: "🌾", bgColor: "bg-[#fadd92]" },
};

const DEFAULT_STYLE = { emoji: "📦", bgColor: "bg-gray-100" };

export function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories<Category[]>();
        if (response.success && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const getStyle = (name: string) => {
    return CATEGORY_MAP[name] || DEFAULT_STYLE;
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0a4d3c]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white">
      <div className="max-w-7xl mx-auto pb-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg md:text-xl font-extrabold text-[#0e3b2e]">Categories</h2>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#a4d45c]/10 text-[#0e3b2e] text-[9px] font-bold uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-[#a4d45c] animate-pulse"></span>
              Fresh
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => scroll("left")}
              className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-[#0e3b2e] hover:bg-[#0e3b2e] hover:text-white transition-all shadow-sm active:scale-95"
              aria-label="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-[#0e3b2e] hover:bg-[#0e3b2e] hover:text-white transition-all shadow-sm active:scale-95"
              aria-label="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-2 py-2"
          >
            {categories.map((category) => {
              const style = getStyle(category.name);
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={category.id}
                  className="flex flex-col items-center gap-2.5 cursor-pointer group/item flex-shrink-0 snap-center transition-transform active:scale-95"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-md flex items-center justify-center text-3xl md:text-4xl shadow-sm border border-black/5 transition-all duration-300 group-hover/item:shadow-md group-hover/item:-translate-y-1 ${style.bgColor}`}>
                    <span className="transition-transform duration-500 group-hover/item:scale-110 group-hover/item:rotate-3">
                      {style.emoji}
                    </span>
                  </div>
                  <span className="text-[11px] md:text-sm font-bold text-[#0e3b2e]/90 group-hover/item:text-[#a4d45c] transition-colors text-center whitespace-nowrap px-1">
                    {category.name}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryCarousel;

