"use client";

import { COMPARISON_TITLE, COMPARISON_SUBTITLE } from "../../data/comparison-content";
import ComparisonTable from "../comparison/ComparisonTable";

export default function ComparisonSection() {
  return (
    <section id="comparison" className="relative py-24 bg-[#0A0A0B] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title Area */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase block">
            Category Separation
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {COMPARISON_TITLE}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            {COMPARISON_SUBTITLE}
          </p>
        </div>

        {/* Interactive Comparison Table */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5 blur-xl pointer-events-none" />
          <div className="relative z-10">
            <ComparisonTable />
          </div>
        </div>
      </div>
    </section>
  );
}
