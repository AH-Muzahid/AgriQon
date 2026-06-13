"use client";

import { FOUNDATION_BADGES } from "../../data/marketing-content";
import { Badge } from "@/components/ui/badge";

export default function FoundationSection() {
  return (
    <section className="relative py-20 bg-[#0A0A0B] border-t border-white/5">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-3">
          <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase block">
            Transactional Compliance
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Powered by Enterprise Infrastructure.
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            Beneath the predictive intelligence layer, Velocity integrates standard, compliant ERP engines to handle heavy daily transactions.
          </p>
        </div>

        {/* Badges Grid */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
          {FOUNDATION_BADGES.map((badge, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="rounded-lg border-white/8 bg-[#111214]/30 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700 hover:text-white"
            >
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
