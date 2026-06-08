"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Cpu, Search, Zap, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Semantic Search",
    description: "Search for 'summer dinner ideas' or 'low acid tomatoes' and our AI understands exactly what you mean.",
    color: "bg-blue-500/10 text-blue-500"
  },
  {
    icon: Brain,
    title: "Freshness Prediction",
    description: "Our algorithms predict peak ripeness based on farm data, ensuring you get produce at its nutritional zenith.",
    color: "bg-emerald-500/10 text-emerald-500"
  },
  {
    icon: Zap,
    title: "Hyper-Local Matching",
    description: "Intelligent logistics route your order to the nearest farm with the highest quality inventory.",
    color: "bg-yellow-500/10 text-yellow-600"
  },
  {
    icon: ShieldCheck,
    title: "Verified Origins",
    description: "AI-powered blockchain verification tracks every vegetable from seedling to your kitchen table.",
    color: "bg-purple-500/10 text-purple-500"
  }
];

export function AIDiscovery() {
  return (
    <section className="w-full py-24 bg-[#f8fafc] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left: Interactive Visual */}
          <div className="w-full lg:w-1/2 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square max-w-md mx-auto"
            >
              {/* Central Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-48 bg-[#0a4d3c] rounded-[3rem] rotate-12 flex items-center justify-center shadow-2xl relative z-10">
                  <Cpu className="size-20 text-[#facc15] animate-pulse" />
                </div>
                
                {/* Orbital Rings */}
                <div className="absolute inset-0 border-2 border-emerald-100 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-4 border border-emerald-100 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                
                {/* Floating Tags */}
                <motion.div 
                   animate={{ y: [0, -10, 0] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="absolute -top-4 left-0 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2"
                >
                   <div className="size-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nutrient Analysis</span>
                </motion.div>

                <motion.div 
                   animate={{ y: [0, 10, 0] }}
                   transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                   className="absolute -bottom-8 right-0 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2"
                >
                   <div className="size-2 rounded-full bg-yellow-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Soil Health Check</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right: Content */}
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black text-[#0a4d3c] tracking-tighter leading-none mb-8">
                Smart Farming. <br />
                <span className="text-emerald-500 italic">Genius Discovery.</span>
              </h2>
              <p className="text-gray-500 text-lg font-medium mb-12 max-w-xl">
                We&apos;re not just a marketplace; we&apos;re a technology platform that ensures the integrity of your food through state-of-the-art AI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {features.map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-4"
                  >
                    <div className={`size-12 rounded-2xl flex items-center justify-center ${feature.color}`}>
                      <feature.icon className="size-6" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0a4d3c] tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AIDiscovery;
