"use client";

import React from "react";

export default function ArchitecturePreview() {
  const layers = [
    { label: "03 // Action", color: "from-violet-500/20 to-violet-500/40 border-violet-500/30 text-violet-400" },
    { label: "02 // Intelligence", color: "from-cyan-500/20 to-cyan-500/40 border-cyan-500/30 text-cyan-400" },
    { label: "01 // Foundation", color: "from-zinc-800 to-zinc-900 border-white/10 text-zinc-400" },
  ];

  return (
    <div className="flex flex-col gap-2 p-4 bg-black/40 rounded-xl border border-white/5 w-60 shrink-0 font-mono text-[9px]">
      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
        Architecture Layer Map
      </span>
      {layers.map((l, idx) => (
        <div
          key={idx}
          className={`flex items-center justify-between rounded-lg border bg-gradient-to-r ${l.color} px-3 py-2 shadow-inner`}
        >
          <span className="font-extrabold tracking-wide">{l.label}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        </div>
      ))}
    </div>
  );
}
