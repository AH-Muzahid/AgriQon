"use client";

import { TRUST_BADGES } from "../../data/hero-content";
import { Badge } from "@/components/ui/badge";

export default function TrustRow() {
  return (
    <div className="mt-8 border-t border-white/5 pt-8">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 text-center">
        Built specifically for high-velocity distribution
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {TRUST_BADGES.map((badge, idx) => (
          <Badge
            key={idx}
            variant="outline"
            className="rounded-full border-white/8 bg-[#111214]/40 px-3.5 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm"
          >
            {badge}
          </Badge>
        ))}
      </div>
    </div>
  );
}
