"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  LayoutGrid, 
  List, 
  ChevronDown, 
  Star,
  ShoppingCart,
  Heart,
  SlidersHorizontal
} from "lucide-react";
import Image from "next/image";
import { apiClient } from "@/lib/api-client";
import { useCart } from "@/context/cart-context";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface Product {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
}

const categories = [
  { label: "All", value: "All" },
  { label: "Mango & Fruits", value: "Fruits" },
  { label: "Vegetables", value: "Vegetables" },
  { label: "Dairy & Eggs", value: "Dairy & Eggs" },
  { label: "Organic Honey", value: "Organic Honey" },
  { label: "Meat & Poultry", value: "Meat & Poultry" },
  { label: "Grains", value: "Grains" },
  { label: "Seeds & Nuts", value: "Seeds & Nuts" },
];

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { addToCart } = useCart();

  useEffect(() => {
    const category = searchParams.get("category") || "All";
    const isKnownCategory = categories.some((item) => item.value === category);
    setActiveCategory(isKnownCategory ? category : "All");
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const category = activeCategory === "All" ? undefined : activeCategory;
        const res = await apiClient.getItems<Product[]>({ category });
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    router.push(category === "All" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id || product._id || "",
      name: product.title,
      price: product.price,
      quantity: 1,
      image: product.imageUrl || "/product_placeholder.png"
    });
    toast.success(`${product.title} added to cart`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Shop Header */}
      <div className="bg-[#0a4d3c] text-white pt-16 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
              The <span className="text-emerald-400">Harvest</span> Catalog
            </h1>
            <p className="text-emerald-100/70 text-lg max-w-2xl mx-auto font-medium">
              Discover farm-fresh produce sourced directly from local master growers. 
              Quality guaranteed, delivered to your doorstep.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-4 flex flex-wrap items-center justify-between gap-4 border border-gray-100">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.value 
                    ? "bg-[#0a4d3c] text-white shadow-lg shadow-emerald-900/20" 
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </button>
            <div className="h-10 w-px bg-gray-100 hidden sm:block"></div>
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl">
              <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-[#0a4d3c]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <LayoutGrid className="size-5" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-white shadow-sm text-[#0a4d3c]" : "text-gray-400 hover:text-gray-600"}`}
              >
                <List className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block space-y-10">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Price Range</h3>
            <div className="space-y-4">
              <input type="range" className="w-full accent-[#0a4d3c]" min="0" max="1000" />
              <div className="flex items-center justify-between font-bold text-sm text-gray-600">
                <span>0 AED</span>
                <span>1000 AED</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Farming Method</h3>
            <div className="space-y-3">
              {["Organic", "Conventional", "Hydroponic", "Vertical Farming"].map(method => (
                <label key={method} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="size-5 rounded-lg border-gray-300 text-[#0a4d3c] focus:ring-[#0a4d3c]" />
                  <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{method}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
            <h4 className="text-emerald-800 font-black mb-2">Need Assistance?</h4>
            <p className="text-emerald-700/70 text-sm mb-4 leading-relaxed">
              Ask our AI assistant for help finding the perfect ingredients for your recipe.
            </p>
            <button className="w-full bg-[#0a4d3c] text-white py-3 rounded-2xl font-bold text-sm transition-all hover:bg-emerald-900">
              Launch Assistant
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <p className="text-gray-500 font-bold">
              Showing <span className="text-gray-900">{products.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-400">Sort by:</span>
              <button className="flex items-center gap-2 text-sm font-black text-[#0a4d3c]">
                Popularity <ChevronDown className="size-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse"></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" 
              : "flex flex-col gap-6"
            }>
              <AnimatePresence>
                {products.map((product: Product, idx) => (
                  <motion.div
                    key={product.id || product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-black/5 hover:border-emerald-100 transition-all duration-500 ${viewMode === "list" ? "flex flex-row h-64" : ""}`}
                  >
                    {/* Image Area */}
                    <div className={`relative overflow-hidden ${viewMode === "list" ? "w-72" : "aspect-square"}`}>
                      <Image
                        src={product.imageUrl || "/product_placeholder.png"}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute top-4 right-4 z-10">
                        <button className="size-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                          <Heart className="size-5" />
                        </button>
                      </div>
                      {product.stock <= 5 && (
                        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-wider">
                          Low Stock
                        </div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                            {product.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold text-gray-600">4.9</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-black text-[#0a4d3c] mb-2 group-hover:text-emerald-700 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 font-medium">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-gray-400 block mb-1">Price</span>
                          <span className="text-2xl font-black text-[#0a4d3c]">
                            {product.price} <span className="text-xs">AED</span>
                          </span>
                        </div>
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="size-12 bg-[#0a4d3c] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/20 active:scale-95 transition-all hover:bg-emerald-900"
                        >
                          <ShoppingCart className="size-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
                <Search className="size-10" />
              </div>
              <h2 className="text-2xl font-black text-[#0a4d3c]">No products found</h2>
              <p className="text-gray-500 font-medium max-w-xs mt-2">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              <button 
                onClick={() => {
                  handleCategoryChange("All");
                }}
                className="mt-8 text-emerald-600 font-black hover:underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc]" />}>
      <ShopPageContent />
    </Suspense>
  );
}
