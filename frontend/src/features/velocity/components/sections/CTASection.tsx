"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MARKETING_ROUTES } from "../../constants/marketing.constants";

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden bg-[#0A0A0B] border-t border-white/5">
      {/* Visual background details */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="rounded-2xl border border-white/8 bg-[#111214]/40 p-10 md:p-16 backdrop-blur-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/30 bg-cyan-950/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            <Sparkles className="h-3 w-3" />
            Immediate Deployment Available
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Stop Managing Data.<br />Start Running an Intelligent Business.
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Move from spreadsheets, disconnected systems, and legacy ERPs to a unified operating system built for modern trade.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={MARKETING_ROUTES.demo}
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-lime-500 px-6 text-sm font-extrabold text-black shadow-lg shadow-lime-500/10 transition-all hover:bg-lime-400 hover:shadow-lime-500/35 active:translate-y-px"
            >
              Request Enterprise Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
