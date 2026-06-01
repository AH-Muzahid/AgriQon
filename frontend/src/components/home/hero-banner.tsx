"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

export function HeroBanner() {
  return (
    <section className="relative w-full min-h-[620px] overflow-hidden bg-[#123a30]">
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/hero.png"
          alt="Fresh produce harvest"
          fill
          className="object-cover object-center brightness-[0.68] contrast-[1.08]"
          priority
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#123a30] via-[#123a30]/82 to-[#123a30]/20" />
        <div className="absolute inset-0 z-10 market-grid opacity-35" />
      </motion.div>

      <div className="relative z-20 mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-2 rounded-md bg-[#f5c542] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#123a30] shadow-xl shadow-yellow-500/20"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#123a30] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#123a30]" />
            </span>
            <Sparkles className="size-3" />
            AI-powered fresh market
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.75 }}
            className="font-display mb-7 text-5xl font-black leading-[0.95] text-white md:text-7xl lg:text-8xl"
          >
            Farm stock, priced and ready today.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.75 }}
            className="mb-10 max-w-xl text-lg font-medium leading-relaxed text-emerald-50/85 md:text-xl"
          >
            AgriQon connects buyers with verified growers, fresh inventory,
            route-aware delivery, and AI search that understands what you are
            cooking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.66, duration: 0.75 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-lg bg-[#f5c542] px-8 py-4 text-base font-black text-[#123a30] shadow-2xl shadow-yellow-500/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              Shop harvest
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/farmers"
              className="inline-flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-8 py-4 text-base font-black text-white backdrop-blur-xl transition-all hover:bg-white/20 active:scale-95"
            >
              Meet farmers
            </Link>
          </motion.div>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["420+", "active lots"],
              ["2 hr", "city delivery"],
              ["98%", "verified farms"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur-md"
              >
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-50/60">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 42 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.72, duration: 0.9 }}
          className="hidden w-full max-w-md justify-self-end rounded-lg border border-white/60 bg-white/95 p-5 text-[#123a30] shadow-2xl lg:block"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-lg bg-[#f5c542] text-[#123a30]">
                <ShoppingBag className="size-7" />
              </div>
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-widest text-[#6c7d73]">
                  Live market board
                </p>
                <p className="text-2xl font-black">AED 5.99/kg</p>
              </div>
            </div>

            {[
              {
                icon: CheckCircle2,
                label: "Greenhouse tomatoes",
                meta: "Al Ain Oasis Farm",
              },
              {
                icon: Truck,
                label: "Delivery slot secured",
                meta: "Today, 6:00 PM",
              },
              {
                icon: MapPin,
                label: "Nearest stock matched",
                meta: "18 km from Abu Dhabi",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg border border-[#dce8de] bg-[#f7faf6] p-4"
              >
                <item.icon className="size-5 text-[#2f7b57]" />
                <div>
                  <p className="font-black">{item.label}</p>
                  <p className="text-xs font-bold text-[#6c7d73]">
                    {item.meta}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroBanner;
