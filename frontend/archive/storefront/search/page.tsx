"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { 
  Search, 
  Sparkles, 
  Loader2,
  TrendingUp
} from "lucide-react";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { ProductCard } from "@/components/ui/product-card";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  category?: { name: string };
  image?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getItems<Product[]>({ search: query });
        if (response.success) {
          setProducts(response.data || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
        toast.error("Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                  <Sparkles className="size-3" />
                  Semantic Search
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-[#0a4d3c] tracking-tight">
                Results for &ldquo;<span className="text-emerald-600">{query}</span>&rdquo;
              </h1>
              <p className="text-gray-500 font-medium mt-2">
                We found {products.length} items that match your request.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="size-10 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                    <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" width={40} height={40} />
                  </div>
                ))}
              </div>
              <p className="text-xs font-bold text-gray-400 max-w-[120px] leading-tight">
                Join 2k+ users finding fresh food today
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="size-12 animate-spin text-[#0a4d3c] mb-4" />
            <p className="text-gray-500 font-black animate-pulse">Scanning the harvest...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {products.map((product: Product) => (
                <div key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.title}
                    category={product.category?.name || "General"}
                    vendor="Local Farmer"
                    location="Dubai, UAE"
                    image={product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"}
                    price={product.price}
                    unit={product.unit}
                  />
                </div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-8">
              <Search className="size-12" />
            </div>
            <h2 className="text-3xl font-black text-[#0a4d3c] mb-4">We couldn&apos;t find that</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
              Our AI couldn&apos;t find an exact match for &ldquo;{query}&rdquo;. 
              Try searching for common categories like vegetables, fruits, or dairy.
            </p>
            
            <div className="mt-12 w-full max-w-lg mx-auto">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center justify-center gap-2">
                <TrendingUp className="size-4" /> Popular Searches
              </h4>
              <div className="flex flex-wrap justify-center gap-3">
                {["Organic Tomatoes", "Fresh Milk", "Local Honey", "Green Apples", "Farm Eggs"].map(s => (
                  <button 
                    key={s}
                    onClick={() => window.location.href = `/search?q=${encodeURIComponent(s)}`}
                    className="px-5 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:border-[#0a4d3c] hover:text-[#0a4d3c] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-12 animate-spin text-[#0a4d3c]" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
