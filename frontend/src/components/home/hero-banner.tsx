"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden bg-[#0a4d3c]">
      {/* Background Image with Parallax-like effect */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/hero.png"
          alt="Premium Farm Fresh"
          fill
          className="object-cover object-center brightness-[0.7] contrast-[1.1]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a4d3c]/90 via-[#0a4d3c]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a4d3c] via-transparent to-transparent z-10" />
      </motion.div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#facc15] text-[#0a4d3c] text-xs font-black uppercase tracking-widest mb-8 shadow-xl shadow-yellow-500/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a4d3c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0a4d3c]"></span>
            </span>
            <Sparkles className="size-3" />
            AI-Powered Freshness
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-8"
          >
            Nature Meets <br />
            <span className="text-[#facc15] italic">Intelligence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-emerald-50/80 text-lg md:text-2xl font-medium max-w-xl mb-12 leading-relaxed"
          >
            AgriQon uses advanced semantic discovery to connect you with the finest organic produce, harvested at peak perfection.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              href="/shop"
              className="group relative inline-flex items-center gap-3 bg-[#facc15] text-[#0a4d3c] px-10 py-6 rounded-2xl font-black text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-yellow-500/40"
            >
              Start Shopping
              <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              href="/farmers"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white border border-white/20 px-10 py-6 rounded-2xl font-black text-xl transition-all hover:bg-white/20 active:scale-95"
            >
              Meet Farmers
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-12 z-20 flex flex-col items-start gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-white/20" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">AgriQon Excellence</span>
        </div>
      </motion.div>

      {/* Floating Card */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden xl:block z-20">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] shadow-2xl max-w-xs"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-[#facc15] flex items-center justify-center text-[#0a4d3c]">
                <ShoppingBag className="size-7" />
              </div>
              <div>
                <p className="text-white font-black text-2xl leading-none">Fresh</p>
                <p className="text-emerald-100/40 text-xs font-bold uppercase tracking-wider mt-1">Guaranteed</p>
              </div>
            </div>
            <div className="h-px bg-white/10" />
            <p className="text-emerald-50/60 text-sm leading-relaxed">
              Our AI monitors harvest cycles in real-time to ensure only the freshest produce reaches your table.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroBanner;
