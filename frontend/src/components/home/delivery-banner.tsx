"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, MapPin } from "lucide-react";

export function DeliveryBanner() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 my-16">
      <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[40px] bg-emerald-950 shadow-2xl">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/delevary-banar.png"
            alt="Eco-friendly delivery"
            fill
            className="object-cover opacity-60 scale-105 transition-transform duration-[20s] hover:scale-100"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/80 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 min-h-[400px] md:min-h-[500px] flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#facc15] text-[#0a4d3c] text-xs font-black uppercase tracking-widest mb-6">
              <Zap className="size-3 fill-[#0a4d3c]" />
              Limited Time Offer
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white leading-[1] mb-6 tracking-tighter">
              Freshness Delivered<br />
              <span className="text-[#facc15]">Zero Emissions.</span>
            </h2>
            
            <p className="text-emerald-50/70 text-lg md:text-xl font-medium mb-10 max-w-lg leading-relaxed">
              Get <span className="text-white font-bold">20% OFF</span> your first 3 deliveries. 
              Farm-to-table in under 2 hours, powered by our new electric fleet.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 mb-10">
              <div className="flex items-center gap-2 text-white/80">
                <ShieldCheck className="size-5 text-[#facc15]" />
                <span className="text-sm font-bold">Halal Certified</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="size-5 text-[#facc15]" />
                <span className="text-sm font-bold">Real-time Tracking</span>
              </div>
            </div>

            <button className="group relative bg-[#facc15] text-[#0a4d3c] px-10 py-4 rounded-full font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[#facc15]/20">
              Claim Your Discount
              <div className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
            </button>
          </motion.div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-10 right-10 opacity-20 hidden lg:block">
          <div className="size-40 border-8 border-white/20 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}
