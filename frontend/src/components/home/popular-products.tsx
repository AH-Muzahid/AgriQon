"use client";

import React, { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/product-card";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import Link from "next/link";
import { products as fallbackProducts } from "@/lib/mock-data";

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
        if (response.success && Array.isArray(response.data) && response.data.length > 0) {
          setProducts(response.data);
        } else {
          setProducts(
            fallbackProducts.slice(0, 8).map((product) => ({
              id: product.id,
              title: product.name,
              price: product.price,
              unit: product.unit,
              image: product.image,
              category: { name: product.category },
              brand: { name: product.vendor },
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts(
          fallbackProducts.slice(0, 8).map((product) => ({
            id: product.id,
            title: product.name,
            price: product.price,
            unit: product.unit,
            image: product.image,
            category: { name: product.category },
            brand: { name: product.vendor },
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="w-full bg-[#f7faf6] px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <p className="mb-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#d46b35]">
              Daily trading floor
            </p>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="font-display text-4xl md:text-5xl font-black text-[#123a30] leading-tight mb-4"
            >
              Curated freshness, ready to cart.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-[#61746a] text-lg font-medium"
            >
              Hand-picked daily from local farms. Verified quality, clear pricing, and fast delivery windows.
            </motion.p>
          </div>
          
          <Link href="/shop">
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group flex items-center gap-2 text-[#123a30] font-black text-sm uppercase tracking-widest hover:gap-4 transition-all"
            >
              Explore Marketplace <ArrowRight className="size-5" />
            </motion.button>
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-100 bg-white animate-pulse rounded-lg border border-[#dce8de]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5">
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
