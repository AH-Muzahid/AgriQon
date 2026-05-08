"use client";

import { products } from "@/lib/mock-data";
import { ProductCard } from "@/components/ui/product-card";

export function PopularProducts() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-14 bg-[#f4f7f6]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#004d2e] tracking-tight">
            Only the Best for You
          </h2>
          <button className="text-sm font-bold text-[#004d2e] hover:opacity-80 transition-opacity flex items-center gap-1">
            See All Products &rarr;
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 sm:gap-2">
          {products.map((product) => (
            <ProductCard
              key={product.name}
              {...product}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
