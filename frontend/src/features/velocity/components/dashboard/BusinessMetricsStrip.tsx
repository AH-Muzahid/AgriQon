"use client";

import { Activity, ShieldCheck, Zap } from "lucide-react";

export default function BusinessMetricsStrip() {
  const metrics = [
    {
      label: "Active Forecasts",
      value: "1,420 SKUs",
      sub: "+12 new today",
      icon: Zap,
      color: "text-cyan-400 bg-cyan-500/10",
    },
    {
      label: "Credit Assessments",
      value: "148 Accounts",
      sub: "Auto-calibrated hourly",
      icon: ShieldCheck,
      color: "text-violet-400 bg-violet-500/10",
    },
    {
      label: "Decision Pipeline",
      value: "৳4.8M Saved",
      sub: "Revenue risk protected",
      icon: Activity,
      color: "text-emerald-400 bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="flex items-center gap-4 rounded-xl border border-white/8 bg-[#111214]/40 p-4.5 backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-[#111214]/60"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-semibold">
                {item.label}
              </span>
              <span className="text-sm font-bold text-white block mt-0.5">{item.value}</span>
              <span className="text-[9px] text-zinc-400 block">{item.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
