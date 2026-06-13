"use client";

import { AI_TIMELINE_STEPS } from "../../data/hero-content";
import { Sparkles, Terminal } from "lucide-react";

export default function AIReasoningTimeline() {
  return (
    <div className="rounded-xl border border-white/8 bg-[#111214]/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/20">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-[#22D3EE] border border-white/10">
          <Terminal className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold tracking-wide text-white font-mono">
            Velocity_Agent_Daemon
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="mt-4 space-y-3 font-mono text-[11px]">
        {AI_TIMELINE_STEPS.map((step, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <span className="text-zinc-500 shrink-0 select-none">{step.time}</span>
            <div className="flex-1 space-y-0.5">
              <span
                className={`inline-block rounded px-1 text-[9px] font-bold uppercase ${
                  step.status === "sync"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/10"
                    : step.status === "analyze"
                    ? "bg-zinc-800 text-zinc-300 border border-white/5"
                    : step.status === "warn"
                    ? "bg-red-500/10 text-red-400 border border-red-500/10"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/10"
                }`}
              >
                {step.status}
              </span>
              <p className="text-zinc-300 mt-0.5">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-lg bg-cyan-950/20 px-3 py-2 border border-cyan-500/10">
        <div className="flex items-center gap-2 text-cyan-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            Autonomous Pipeline Active
          </span>
        </div>
        <span className="text-[10px] text-cyan-400/70 font-mono">Status: OK</span>
      </div>
    </div>
  );
}
