"use client";

import { COMMAND_CENTER_TITLE, COMMAND_CENTER_SUBTITLE } from "../../data/command-center-content";
import SimulatedConsole from "../command-center/SimulatedConsole";

export default function CommandCenterSection() {
  return (
    <section id="command-center" className="relative py-24 bg-[#0A0A0B] border-t border-white/5">
      {/* Decorative vertical lines */}
      <div className="absolute inset-y-0 left-1/3 w-[1px] bg-white/[0.02] pointer-events-none" />
      <div className="absolute inset-y-0 right-1/3 w-[1px] bg-white/[0.02] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title Area */}
        <div className="max-w-3xl mb-16 space-y-4 text-center mx-auto">
          <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase block">
            System of Action
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {COMMAND_CENTER_TITLE}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {COMMAND_CENTER_SUBTITLE}
          </p>
        </div>

        {/* Live Interactive Terminal console */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-cyan-500/10 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <SimulatedConsole />
          </div>
        </div>
      </div>
    </section>
  );
}
