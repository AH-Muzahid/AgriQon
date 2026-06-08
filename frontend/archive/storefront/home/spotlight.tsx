"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SPOTLIGHT_ITEMS = [
  {
    id: "1",
    title: "Artisanal Desert Honey",
    subtitle: "Limited Harvest",
    description: "Pure, unfiltered honey harvested from the nectar of desert wild flowers in the Liwa Oasis. A rare seasonal delicacy.",
    image: "/images/honey-spotlight.png",
    price: "85",
    tags: ["Organic", "Small Batch"],
    rating: 4.9,
    orders: 120
  },
  {
    id: "2",
    title: "Heritage Heirloom Tomatoes",
    subtitle: "Farm to Table",
    description: "Multi-colored heirloom varieties grown using sustainable hydro-organic methods. Bursting with natural flavor.",
    image: "/images/tomatoes-spotlight.png",
    price: "24",
    tags: ["Fresh", "GMO-Free"],
    rating: 4.8,
    orders: 85
  }
];

export function Spotlight() {
  return (
    <section className="w-full py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-4"
            >
              <div className="h-px w-8 bg-emerald-500" />
              <span className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px]">Exceptional Selections</span>
            </motion.div>
            <h2 className="text-4xl md:text-7xl font-black text-[#0a4d3c] tracking-tighter leading-[0.9]">
              The <span className="text-emerald-500 italic">Spotlight.</span>
            </h2>
            <p className="text-gray-500 mt-6 text-lg font-medium leading-relaxed">
              Discover our weekly curation of the most exceptional farm-fresh products, handpicked by our expert agronomists.
            </p>
          </div>
          <Link href="/shop?featured=true" className="group flex items-center gap-3 text-sm font-black text-[#0a4d3c] transition-all">
            <span className="relative">
              VIEW ALL SELECTIONS
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </span>
            <div className="size-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
              <ArrowRight className="size-4" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {SPOTLIGHT_ITEMS.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="group relative h-[500px] md:h-[650px] rounded-[3rem] overflow-hidden bg-[#f8fafc] border border-gray-100 shadow-2xl shadow-gray-200/50"
            >
              {/* Background Image */}
              <div className="absolute inset-0 z-0">
                <Image 
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a4d3c] via-[#0a4d3c]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Badges */}
              <div className="absolute top-8 left-8 z-20 flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span key={tag} className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Content Card */}
              <div className="absolute inset-x-0 bottom-0 z-20 p-8 md:p-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-[#facc15] text-[#0a4d3c] text-[10px] font-black">
                      <Star className="size-3 fill-current" />
                      {item.rating}
                    </div>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-tighter">
                      {item.orders}+ Orders
                    </span>
                  </div>

                  <p className="text-[#facc15] font-black uppercase tracking-[0.3em] text-[10px] mb-3">{item.subtitle}</p>
                  <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6 group-hover:translate-x-2 transition-transform duration-700">
                    {item.title}
                  </h3>
                  <p className="text-emerald-50/80 text-sm md:text-lg max-w-md font-medium leading-relaxed mb-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Starting from</span>
                      <span className="text-3xl md:text-4xl font-black text-white flex items-start">
                        <span className="text-sm mt-2 mr-1">AED</span>
                        {item.price}
                      </span>
                    </div>
                    <button className="h-16 px-10 rounded-2xl bg-[#facc15] text-[#0a4d3c] font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group/btn">
                      SECURE YOURS
                      <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 p-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="size-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  <Sparkles className="size-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Spotlight;
