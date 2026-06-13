"use client";

import { DEMAND_FORECAST_DATA } from "../../data/hero-content";
import { TrendingUp, BarChart2 } from "lucide-react";

export default function DemandForecastCard() {
  const { productName, trend, percentage, region } = DEMAND_FORECAST_DATA;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 bg-[#111214]/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/20 hover:bg-[#111214]/80">
      <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-cyan-500/5 blur-2xl" />

      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <BarChart2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
              Demand Forecasting
            </span>
            <h4 className="text-xs font-semibold text-white">{region}</h4>
          </div>
        </div>
        <div className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 flex items-center gap-1 border border-emerald-500/10">
          <TrendingUp className="h-3 w-3" />
          +{percentage}%
        </div>
      </div>

      <div className="mt-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 block">Product</span>
            <p className="text-xs font-medium text-white truncate w-28">{productName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 block">Trend</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
              {trend}
            </span>
          </div>
        </div>

        {/* Dynamic miniature trend line in SVG */}
        <div className="h-14 w-full pt-1">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradient-cyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area path */}
            <path
              d="M0,25 Q15,22 30,15 T60,18 T90,5 L100,2 L100,30 L0,30 Z"
              fill="url(#gradient-cyan)"
            />
            {/* Line path */}
            <path
              d="M0,25 Q15,22 30,15 T60,18 T90,5 L100,2"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Pulse node */}
            <circle cx="100" cy="2" r="2.5" fill="#22D3EE" />
            <circle cx="100" cy="2" r="5" fill="#22D3EE" className="animate-ping" style={{ transformOrigin: "100px 2px" }} />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-white/5 pt-2">
          <span>Q2 Baseline</span>
          <span>Forecast Peak (30d)</span>
        </div>
      </div>
    </div>
  );
}
