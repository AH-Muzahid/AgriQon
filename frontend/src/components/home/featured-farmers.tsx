"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

import { vendors } from "@/lib/mock-data";

export function FeaturedFarmers() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-24 bg-[#0a4d3c]/05 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
          >
            Meet the Masters
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-[#0a4d3c] tracking-tight mb-6"
          >
            Rooted in <span className="text-emerald-500 italic">Tradition.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-500 text-lg max-w-2xl mx-auto font-medium"
          >
            We partner with local farmers who prioritize soil health and organic practices. 
            Know exactly where your food comes from.
          </motion.p>
        </div>

        <div className="space-y-12">
          {vendors.map((farmer, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative grid lg:grid-cols-2 gap-12 items-center bg-white rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-emerald-950/5 border border-white hover:border-emerald-100 transition-colors duration-500"
            >
              {/* Image Column */}
              <div className={`relative aspect-[4/5] md:aspect-video lg:aspect-square overflow-hidden rounded-[2.5rem] ${idx % 2 !== 0 ? 'lg:order-2' : ''}`}>
                <Image
                  src={farmer.image}
                  alt={farmer.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                <div className="absolute bottom-8 left-8 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="size-5 fill-[#facc15] text-[#facc15]" />
                    <span className="text-xl font-black">{farmer.rating}</span>
                  </div>
                  <p className="text-sm font-medium opacity-80">Farmer Rating</p>
                </div>
              </div>

              {/* Content Column */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-3xl md:text-4xl font-black text-[#0a4d3c]">{farmer.name}</h3>
                  {farmer.isVerified && (
                    <CheckCircle2 className="size-8 text-emerald-500 fill-emerald-50" />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 text-gray-600 font-bold text-sm">
                    <MapPin className="size-4" />
                    {farmer.location}
                  </div>
                  <div className="text-sm font-bold text-[#0a4d3c]/60">
                    Member since {farmer.since}
                  </div>
                </div>

                <div className="mb-10">
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">Signature Produce</h4>
                  <div className="flex flex-wrap gap-2">
                    {farmer.products?.map(p => (
                      <span key={p} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-500 text-lg leading-relaxed mb-10 italic">
                  &quot;Growing food is a responsibility we take seriously. Every pepper in this crate is a result of sustainable soil management and desert-resilient techniques.&quot;
                </p>

                <div className="flex items-center gap-4">
                  <button className="bg-[#0a4d3c] text-white px-8 py-4 rounded-2xl font-black transition-all hover:bg-emerald-900 shadow-xl shadow-emerald-950/10 active:scale-95">
                    Visit Farm Store
                  </button>
                  <button className="flex items-center gap-2 text-[#0a4d3c] font-black px-6 py-4 hover:gap-4 transition-all">
                    Full Profile <ArrowRight className="size-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
