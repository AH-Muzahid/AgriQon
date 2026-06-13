"use client";

import StockoutRiskCard from "./StockoutRiskCard";
import CreditRiskCard from "./CreditRiskCard";
import DemandForecastCard from "./DemandForecastCard";
import AIReasoningTimeline from "./AIReasoningTimeline";

export default function CommandCenterPreview() {
  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/8 bg-[#111214]/30 p-4 md:p-6 backdrop-blur-md shadow-2xl shadow-cyan-950/10">
      {/* Decorative window headers */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/30" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/30" />
          <span className="h-3 w-3 rounded-full bg-green-500/30" />
          <span className="text-[10px] font-mono text-zinc-500 ml-2 select-none uppercase tracking-widest">
            Velocity Command Center v1.4 // Live
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
            Predictive Autopilot Engaged
          </span>
        </div>
      </div>

      {/* Grid of Decomposed Visual Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StockoutRiskCard />
        <CreditRiskCard />
        <DemandForecastCard />
      </div>

      <div className="mt-4">
        <AIReasoningTimeline />
      </div>
    </div>
  );
}
