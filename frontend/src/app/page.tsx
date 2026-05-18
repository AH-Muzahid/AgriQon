"use client";



import { HeroBanner } from "@/components/home/hero-banner";
import { CategoryCarousel } from "@/components/home/category-carousel";
import { PromoBanners } from "@/components/home/promo-banners";
import { PopularProducts } from "@/components/home/popular-products";
import { DeliveryBanner } from "@/components/home/delivery-banner";
import { FeaturedFarmers } from "@/components/home/featured-farmers";
import { SeasonalMarquee } from "@/components/home/seasonal-marquee";
import { AIDiscovery } from "@/components/home/ai-discovery";
import { Spotlight } from "@/components/home/spotlight";

export default function MarketplaceHome() {

  return (
    <main className="storefront bg-[#f8fafc]">
      <SeasonalMarquee />
      <HeroBanner />
      <div className="space-y-12 pb-20">
        <CategoryCarousel />
        <PromoBanners />
        <AIDiscovery />
        <Spotlight />
        <PopularProducts />
        <DeliveryBanner />
        <FeaturedFarmers />
      </div>
    </main>
  );
}
