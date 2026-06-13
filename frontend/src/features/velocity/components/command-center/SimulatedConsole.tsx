"use client";

import React, { useState } from "react";
import { COMMAND_CENTER_PROMPTS } from "../../data/command-center-content";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";

export default function SimulatedConsole() {
  const [activePromptId, setActivePromptId] = useState(COMMAND_CENTER_PROMPTS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const activePrompt = COMMAND_CENTER_PROMPTS.find((p) => p.id === activePromptId) || COMMAND_CENTER_PROMPTS[0];

  const handlePromptClick = (id: string) => {
    if (id === activePromptId) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setActivePromptId(id);
      setIsAnalyzing(false);
    }, 600); // short delay to show ML analysis processing
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 max-w-5xl mx-auto">
      {/* Prompts Sidebar (Left) */}
      <div className="lg:col-span-4 space-y-3">
        <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase block pl-1">
          Select Command Query
        </span>
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0 no-scrollbar">
          {COMMAND_CENTER_PROMPTS.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePromptClick(item.id)}
              className={`w-fit lg:w-full shrink-0 text-left rounded-xl border p-3.5 transition-all text-xs font-semibold backdrop-blur-md ${
                activePromptId === item.id
                  ? "border-[#22D3EE]/30 bg-cyan-950/15 text-white"
                  : "border-white/5 bg-[#111214]/40 text-zinc-400 hover:text-white hover:border-white/15"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase tracking-wider text-cyan-400">
                  {item.category}
                </span>
              </div>
              <p className="line-clamp-1">{item.prompt}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main AI Terminal Panel (Right) */}
      <Card className="lg:col-span-8 overflow-hidden rounded-2xl border border-white/8 bg-[#111214]/40 p-5 md:p-6 backdrop-blur-xl relative">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/3 blur-3xl pointer-events-none" />

        {/* Input Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2 text-white font-mono text-xs w-full">
            <span className="text-cyan-400 font-bold font-sans">query_agent:~$</span>
            <span className="text-zinc-200 truncate">{activePrompt.prompt}</span>
          </div>
          <CornerDownLeft className="h-3.5 w-3.5 text-zinc-650 shrink-0" />
        </div>

        {/* Analysis Loading State */}
        {isAnalyzing ? (
          <div className="h-56 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Running ML risk neural analysis...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Outcome Overview */}
            <div className="flex items-start gap-2.5 bg-cyan-950/10 border border-cyan-500/10 rounded-xl p-3.5">
              <Sparkles className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block">
                  Autonomous Decision Summary
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  {activePrompt.response.outcome}
                </p>
              </div>
            </div>

            {/* Reasoning Timeline */}
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
                ML Reasoning Details
              </span>
              <ul className="space-y-2">
                {activePrompt.response.reasoning.map((reason, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed"
                  >
                    <span className="text-cyan-400 mt-1 select-none">↳</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4">
              {activePrompt.response.metrics.map((m, idx) => (
                <div key={idx}>
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono">
                    {m.label}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-white">{m.value}</span>
                    {m.trend && <span className="text-[9px] text-red-400 font-mono">{m.trend}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Ready to Execute recommendation block */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-900/60 p-3.5 border border-white/5">
              <div className="max-w-[75%]">
                <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest block">
                  Autopilot Recommendation
                </span>
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-normal">
                  {activePrompt.response.recommendation}
                </p>
              </div>
              <button className="h-8 rounded-lg bg-white px-3.5 text-xs font-bold text-black flex items-center gap-1 transition-all hover:bg-zinc-200 active:translate-y-px">
                Execute
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
