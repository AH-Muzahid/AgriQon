"use client";

import { STOCKOUT_RISK_DATA } from "../../data/hero-content";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";

export default function StockoutRiskCard() {
  const { sku, name, daysRemaining, recommendedTransfer, revenueSaved, confidence } =
    STOCKOUT_RISK_DATA;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[#111214]/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/20 hover:bg-[#111214]/80">
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl" />
      
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Inventory Intelligence
            </span>
            <h4 className="text-xs font-semibold text-white">{sku}</h4>
          </div>
        </div>
        <div className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 flex items-center gap-1 border border-red-500/10">
          <AlertTriangle className="h-3 w-3" />
          {daysRemaining} Days Left
        </div>
      </div>

      <div className="mt-4 space-y-3.5">
        <div>
          <span className="text-[10px] text-zinc-500 block">Product</span>
          <p className="text-sm font-medium text-white truncate">{name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 block">Saved Revenue</span>
            <p className="text-base font-bold text-white">৳{revenueSaved.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">ML Confidence</span>
            <p className="text-base font-bold text-cyan-400">{confidence}%</p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-900/60 p-2.5 border border-white/5">
          <span className="text-[9px] font-semibold text-cyan-400 uppercase tracking-wider block">
            Recommended Action
          </span>
          <div className="mt-1 flex items-center justify-between text-xs text-zinc-300">
            <span>Transfer {recommendedTransfer} Units</span>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-white">Warehouse 3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
