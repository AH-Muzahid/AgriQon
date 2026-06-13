"use client";

import { Sparkles, Brain, ArrowRight } from "lucide-react";
import Link from "next/link";
import { WHY_VELOCITY_HEADLINE, WHY_VELOCITY_SUBHEADLINE } from "../../data/marketing-content";
import { MARKETING_ROUTES } from "../../constants/marketing.constants";

export default function WhyVelocitySection() {
  return (
    <section id="why-velocity" className="relative py-24 overflow-hidden bg-[#0A0A0B]">
      {/* Decorative vertical grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl border border-white/8 bg-[#111214]/40 p-8 md:p-14 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-violet-500/5 blur-3xl" />
          
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-3.5 py-1 text-xs font-bold text-violet-400">
              <Sparkles className="h-3.5 w-3.5" />
              Category Shift
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {WHY_VELOCITY_HEADLINE}
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
              {WHY_VELOCITY_SUBHEADLINE}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link
                href={MARKETING_ROUTES.demo}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-white px-5 text-xs font-bold text-black hover:bg-zinc-200 transition-all active:translate-y-px"
              >
                Request Enterprise Demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              
              <div className="flex items-center gap-2.5 text-zinc-500">
                <Brain className="h-4.5 w-4.5 text-cyan-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Active Intelligence Engine Running
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
