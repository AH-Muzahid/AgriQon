"use client";

import { CREDIT_RISK_DATA } from "../../data/hero-content";
import { AlertCircle, Clock, TrendingDown } from "lucide-react";

export default function CreditRiskCard() {
  const { customerName, riskLevel, expectedDelayDays, outstandingAmount } = CREDIT_RISK_DATA;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[#111214]/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/20 hover:bg-[#111214]/80">
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-violet-500/5 blur-2xl" />

      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">
              Credit Intelligence
            </span>
            <h4 className="text-xs font-semibold text-white">Accounts Receivable</h4>
          </div>
        </div>
        <div className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 flex items-center gap-1 border border-amber-500/10">
          <Clock className="h-3 w-3" />
          +{expectedDelayDays}d Delay
        </div>
      </div>

      <div className="mt-4 space-y-3.5">
        <div>
          <span className="text-[10px] text-zinc-500 block">Customer</span>
          <p className="text-sm font-medium text-white truncate">{customerName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 block">Outstanding</span>
            <p className="text-base font-bold text-white">৳{outstandingAmount.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">Risk Status</span>
            <p className="text-base font-bold text-red-500">{riskLevel}</p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-white/5 flex items-start gap-2">
          <div className="mt-0.5 text-amber-400">
            <TrendingDown className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-[9px] font-semibold text-violet-400 uppercase tracking-wider block">
              Cash Flow Impact
            </span>
            <p className="mt-0.5 text-xs text-zinc-300">
              Delay will defer purchasing budget by 12 days. Reroute collection team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
