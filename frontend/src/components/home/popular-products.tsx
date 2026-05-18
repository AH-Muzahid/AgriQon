"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";

interface BackendProduct {
  id: string;
  title: string;
  price: number;
  unit: string;
  image?: string;
  category?: { name: string };
  brand?: { name: string };
}

export function PopularProducts() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiClient.getItems<BackendProduct[]>();
        if (response.success && Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-black text-[#0a4d3c] tracking-tighter mb-4"
            >
              Curated Freshness.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-gray-500 text-lg font-medium"
            >
              Hand-picked daily from local organic farms. Verified quality, delivered to your doorstep.
            </motion.p>
          </div>
          
          <Link href="/shop">
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group flex items-center gap-2 text-[#0a4d3c] font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
            >
              Explore Marketplace <ArrowRight className="size-5" />
            </motion.button>
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-[2.5rem]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.title}
                category={product.category?.name || "General"}
                vendor={product.brand?.name || "Local Farmer"}
                location="Dubai, UAE"
                image={product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000"}
                price={product.price}
                unit={product.unit}
                className={index >= 4 ? "hidden lg:flex" : ""}
              />
            ))}
          </div>
        )}
        
        {/* Mobile View More */}
        <div className="mt-12 text-center lg:hidden">
          <Link href="/shop">
            <button className="w-full h-14 rounded-2xl border-2 border-emerald-100 text-[#0a4d3c] font-bold hover:bg-emerald-50 transition-colors">
              View More Products
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

