"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType } from "react";
import {
  Apple,
  Beef,
  ChevronLeft,
  ChevronRight,
  Fish,
  GlassWater,
  Loader2,
  Milk,
  Package,
  Sprout,
  Wheat,
} from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

interface Category {
  id: string;
  name: string;
}

const FALLBACK_CATEGORIES: Category[] = [
  { id: "vegetables", name: "Vegetables" },
  { id: "fruits", name: "Fruits" },
  { id: "dairy", name: "Dairy" },
  { id: "meat", name: "Meat" },
  { id: "sea-food", name: "Sea Food" },
  { id: "grains", name: "Grains" },
  { id: "organic", name: "Organic" },
  { id: "drinks", name: "Drinks" },
];

const CATEGORY_STYLE: Record<
  string,
  { icon: ElementType; tone: string; hint: string }
> = {
  Vegetables: { icon: Sprout, tone: "bg-[#dff3df] text-[#1f6b45]", hint: "picked today" },
  Fruits: { icon: Apple, tone: "bg-[#ffe1d6] text-[#a83b25]", hint: "peak season" },
  Dairy: { icon: Milk, tone: "bg-[#e4f0ff] text-[#285f97]", hint: "chilled" },
  Meat: { icon: Beef, tone: "bg-[#ffe3e8] text-[#9f3146]", hint: "halal cuts" },
  "Sea Food": { icon: Fish, tone: "bg-[#dff5ff] text-[#18617a]", hint: "daily catch" },
  Grains: { icon: Wheat, tone: "bg-[#fff1c6] text-[#8d6412]", hint: "bulk lots" },
  Organic: { icon: Sprout, tone: "bg-[#e7ead3] text-[#52641f]", hint: "certified" },
  Drinks: { icon: GlassWater, tone: "bg-[#ece7ff] text-[#5946a3]", hint: "cold press" },
};

export function CategoryCarousel() {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories<Category[]>();
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
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
    const node = scrollRef.current;
    if (!node) return;
    const scrollAmount = node.clientWidth * 0.75;
    node.scrollTo({
      left: direction === "left" ? node.scrollLeft - scrollAmount : node.scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full border-b border-[#dce8de] bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d46b35]">
              Browse the market
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#123a30] md:text-3xl">
              Shop by harvest category
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="flex size-9 items-center justify-center rounded-lg border border-[#dce8de] text-[#123a30] transition-all hover:bg-[#123a30] hover:text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex size-9 items-center justify-center rounded-lg border border-[#dce8de] text-[#123a30] transition-all hover:bg-[#123a30] hover:text-white"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-24 items-center justify-center">
            <Loader2 className="size-7 animate-spin text-[#123a30]" />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="no-scrollbar flex snap-x gap-3 overflow-x-auto scroll-smooth py-1"
          >
            {categories.map((category, index) => {
              const style = CATEGORY_STYLE[category.name] || {
                icon: Package,
                tone: "bg-[#eef2f0] text-[#4e6259]",
                hint: "fresh stock",
              };
              const Icon = style.icon;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  key={category.id}
                  className="group grid min-w-[170px] snap-start grid-cols-[48px_1fr] items-center gap-3 rounded-lg border border-[#dce8de] bg-[#fbfdfb] p-3 transition-all hover:-translate-y-1 hover:border-[#9cc6a9] hover:shadow-lg hover:shadow-emerald-950/5"
                >
                  <div className={`flex size-12 items-center justify-center rounded-lg ${style.tone}`}>
                    <Icon className="size-6" />
                  </div>
                  <div>
                    <p className="font-black text-[#123a30]">{category.name}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#75877d]">
                      {style.hint}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default CategoryCarousel;
