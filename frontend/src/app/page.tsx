"use client";

import { vendors } from "@/lib/mock-data";
import Link from "next/link";

import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { PromoBanners } from "@/components/home/promo-banners";
import { PopularProducts } from "@/components/home/popular-products";
import { DeliveryBanner } from "@/components/home/delivery-banner";

export default function MarketplaceHome() {

  return (
    <main className="storefront">
      <HeroBanner />
      <CategoryCarousel />
      <PromoBanners />

      <PopularProducts />
      <DeliveryBanner />

      {/* Vendors Section */}
      <section id="vendors" className="w-full px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[#a4d45c] font-bold text-xs uppercase tracking-widest mb-2">Partner Network</p>
              <h2 className="text-2xl sm:text-3xl font-black text-[#004d2e] tracking-tight">Trusted Seller Network</h2>
            </div>
            <Link href="/about" className="text-sm font-bold text-[#004d2e] hover:opacity-80 transition-opacity">
              About AgriQon &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <article 
                key={vendor.name}
                className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-black/5 hover:border-emerald-100 transition-all duration-300 cursor-pointer"
              >
                <div className="size-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-2xl font-bold text-[#004d2e] shadow-sm group-hover:scale-110 transition-transform">
                  {vendor.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-[#004d2e] transition-colors">{vendor.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{vendor.specialty}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {vendor.sales} sales
                    </span>
                    <span className="size-1 bg-slate-300 rounded-full"></span>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                      Top Rated
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
