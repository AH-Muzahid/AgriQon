"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, Leaf, ShoppingBag } from "lucide-react";

const DEALS = [
  { text: "Organic Honey - 25% Off", icon: Sparkles },
  { text: "Farm Fresh Eggs - New Batch", icon: Leaf },
  { text: "Local Abu Dhabi Dates - 15% Off", icon: Zap },
  { text: "Heirloom Tomatoes - Peak Season", icon: ShoppingBag },
  { text: "Cold Pressed Olive Oil - Limited", icon: Sparkles },
  { text: "Grass-Fed Dairy - Free Delivery", icon: Leaf },
];

export function SeasonalMarquee() {
  return (
    <div className="w-full bg-[#f5c542] py-3 overflow-hidden border-y border-[#0e3b2e]/10">
      <div className="flex whitespace-nowrap">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex items-center gap-12 pr-12"
        >
          {[...DEALS, ...DEALS, ...DEALS].map((deal, idx) => (
            <div key={idx} className="flex items-center gap-3 text-[#0a4d3c] font-black uppercase tracking-widest text-[10px] md:text-xs">
              <deal.icon className="size-4" />
              <span>{deal.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default SeasonalMarquee;
