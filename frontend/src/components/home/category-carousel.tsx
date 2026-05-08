"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  { name: "Vegetables", emoji: "🍅", bgColor: "bg-[#fce5df]" },
  { name: "Fruits", emoji: "🍏", bgColor: "bg-[#b6edd6]" },
  { name: "Drinks", emoji: "🍹", bgColor: "bg-[#d8a43f]" },
  { name: "Meat", emoji: "🥩", bgColor: "bg-[#b4ddf5]" },
  { name: "Bakery", emoji: "🍞", bgColor: "bg-[#fadd92]" },
  { name: "Eggs", emoji: "🥚", bgColor: "bg-[#d4e5c8]" },
  { name: "Sea Food", emoji: "🐟", bgColor: "bg-[#97cbeb]" },
  { name: "Snacks", emoji: "🍿", bgColor: "bg-[#fce5df]" },
  { name: "Dairy", emoji: "🧀", bgColor: "bg-[#fadd92]" },
  { name: "Frozen", emoji: "🍦", bgColor: "bg-[#b4ddf5]" },
  { name: "Kitchen", emoji: "🔪", bgColor: "bg-[#d4e5c8]" },
  { name: "Baby Care", emoji: "👶", bgColor: "bg-[#b6edd6]" },
];

export function CategoryCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 bg-white">
      <div className="max-w-7xl mx-auto pb-4">
        {/* Header section - Even more compact */}
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

        {/* Carousel section - Compact cards with rounded-md and snapping */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-2 py-2"
          >
            {categories.map((category, index) => (
              <div 
                key={`${category.name}-${index}`}
                className="flex flex-col items-center gap-2.5 cursor-pointer group/item flex-shrink-0 snap-center transition-transform active:scale-95"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-md flex items-center justify-center text-3xl md:text-4xl shadow-sm border border-black/5 transition-all duration-300 group-hover/item:shadow-md group-hover/item:-translate-y-1 ${category.bgColor}`}>
                  <span className="transition-transform duration-500 group-hover/item:scale-110 group-hover/item:rotate-3">
                    {category.emoji}
                  </span>
                </div>
                <span className="text-[11px] md:text-sm font-bold text-[#0e3b2e]/90 group-hover/item:text-[#a4d45c] transition-colors text-center whitespace-nowrap px-1">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryCarousel;
