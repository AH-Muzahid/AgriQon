"use client";

import { DATA_FLOW_TITLE, DATA_FLOW_COLUMNS } from "../../data/marketing-content";
import { ArrowRight, Database, Brain, Play } from "lucide-react";

const colIcons = [Database, Brain, Play];
const colBorderColors = [
  "border-white/8 hover:border-zinc-750",
  "border-cyan-500/20 hover:border-cyan-500/40",
  "border-violet-500/20 hover:border-violet-500/40",
];
const colTextColors = ["text-zinc-400", "text-cyan-400", "text-violet-400"];
const colBgColors = ["bg-[#111214]/30", "bg-cyan-950/10", "bg-violet-950/10"];

export default function DataFlowSection() {
  return (
    <section className="relative py-24 bg-[#0A0A0B] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase block">
            System Mechanics
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {DATA_FLOW_TITLE}
          </h2>
        </div>

        {/* 3-Column Pipeline */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 relative">
          {DATA_FLOW_COLUMNS.map((col, idx) => {
            const Icon = colIcons[idx];
            return (
              <div key={idx} className="relative">
                {/* Column Card */}
                <div
                  className={`rounded-2xl border ${colBorderColors[idx]} ${colBgColors[idx]} p-6 backdrop-blur-xl transition-all duration-300 relative`}
                >
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-4">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 ${colTextColors[idx]}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-widest">
                      {col.title}
                    </h3>
                  </div>

                  <ul className="space-y-3">
                    {col.items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="flex items-center gap-2.5 rounded-lg bg-[#111214]/40 px-3.5 py-2.5 border border-white/5 text-xs text-zinc-300 transition-all hover:bg-zinc-800/40"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${colTextColors[idx].replace("text-", "bg-")}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connecting arrow indicator for desktops */}
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-6 -translate-y-1/2 z-20 items-center justify-center h-10 w-10 rounded-full border border-white/8 bg-[#111214] text-zinc-500 shadow-xl">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
