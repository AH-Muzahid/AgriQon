"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { HERO_BADGE, HERO_SUBHEADLINE } from "../../data/hero-content";
import { MARKETING_ROUTES, CTA_TEXT } from "../../constants/marketing.constants";
import TrustRow from "../dashboard/TrustRow";
import CommandCenterPreview from "../dashboard/CommandCenterPreview";
import BusinessMetricsStrip from "../dashboard/BusinessMetricsStrip";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
} as const;

export default function HeroSection() {
  return (
    <main className="overflow-hidden bg-[#0A0A0B] relative pt-24">
      {/* Visual background details - Tailark Grid Backlights */}
      <div aria-hidden className="absolute inset-0 isolate hidden contain-strict lg:block pointer-events-none">
        <div className="w-[140px] h-[320px] -translate-y-[87.5px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
        <div className="h-[320px] absolute left-0 top-0 w-[240px] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
      </div>

      <section className="relative">
        {/* Glow backdrop */}
        <div className="absolute inset-0 -z-10 size-full bg-[radial-gradient(125%_125%_at_50%_100%,transparent_0%,#0A0A0B_75%)] pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6">
          <div className="sm:mx-auto lg:mr-auto lg:mt-0 space-y-6 text-center">
            {/* Custom Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-500/30 bg-lime-950/20 px-3.5 py-1 text-xs font-bold text-lime-400">
              <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-pulse" />
              {HERO_BADGE}
            </div>

            {/* Custom Header using TextEffect */}
            <TextEffect
              preset="fade-in-blur"
              speedSegment={0.3}
              as="h1"
              className="mt-8 max-w-3xl text-balance text-4xl sm:text-6xl font-black tracking-tight text-white mx-auto leading-tight"
            >
              Know What To Stock. Know What To Buy. Know What To Do Next.
            </TextEffect>

            {/* Subheadline using TextEffect */}
            <TextEffect
              per="line"
              preset="fade-in-blur"
              speedSegment={0.3}
              delay={0.4}
              as="p"
              className="mt-8 max-w-2xl text-pretty text-sm sm:text-base text-zinc-400 mx-auto leading-relaxed"
            >
              {HERO_SUBHEADLINE}
            </TextEffect>

            {/* Animated Actions */}
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.6,
                    },
                  },
                },
                ...transitionVariants,
              }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <div key={1} className="relative group/btn w-full sm:w-auto">
                <div className="absolute -inset-0.5 rounded-lg bg-lime-500/20 opacity-0 blur-md transition-all group-hover/btn:opacity-100" />
                <Button asChild size="lg" className="w-full sm:w-auto rounded-lg bg-lime-500 hover:bg-lime-400 text-black px-6 h-11 font-extrabold text-sm flex items-center justify-center gap-2">
                  <Link href={MARKETING_ROUTES.demo}>
                    <span className="inline-flex items-center gap-1.5">
                      Deploy Velocity Today
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </div>

              <Button
                key={2}
                asChild
                size="lg"
                variant="ghost"
                className="w-full sm:w-auto h-11 rounded-lg border border-white/10 bg-white/5 px-6 text-sm font-extrabold text-white transition-all hover:bg-white/10 hover:border-white/20"
              >
                <Link href={MARKETING_ROUTES.demo}>
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    {CTA_TEXT.secondary}
                  </span>
                </Link>
              </Button>
            </AnimatedGroup>

            {/* Target markets row */}
            <TrustRow />
          </div>
        </div>

        {/* Dashboard Preview wrapped in Premium Inset Shadows */}
        <AnimatedGroup
          variants={{
            container: {
              visible: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.8,
                },
              },
            },
            ...transitionVariants,
          }}
        >
          <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-white/8 p-4 shadow-2xl shadow-zinc-950/15 bg-[#0A0A0B]/85">
              <CommandCenterPreview />
            </div>
          </div>
        </AnimatedGroup>

        {/* Business summary metrics strip */}
        <div className="mt-10 relative z-20 max-w-5xl mx-auto px-6">
          <BusinessMetricsStrip />
        </div>
      </section>

      {/* Customer Partner Logos Section */}
      <section className="bg-[#0A0A0B] pb-16 pt-16 md:pb-24 border-t border-white/5 mt-10">
        <div className="group relative m-auto max-w-5xl px-6">
          <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
            <Link href={MARKETING_ROUTES.demo} className="inline-flex items-center text-xs font-bold text-lime-400 hover:opacity-75">
              Meet Our Integration Partners
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="group-hover:blur-xs mx-auto mt-6 grid grid-cols-2 gap-x-12 gap-y-8 transition-all duration-500 group-hover:opacity-30 sm:grid-cols-4 lg:grid-cols-8 text-center text-zinc-500 font-mono text-[10px] uppercase tracking-widest font-bold">
            <div className="flex items-center justify-center h-10 border border-white/5 bg-[#111214]/20 rounded-lg">
              Vercel
            </div>
            <div className="flex items-center justify-center h-10 border border-white/5 bg-[#111214]/20 rounded-lg">
              Supabase
            </div>
            <div className="flex items-center justify-center h-10 border border-white/5 bg-[#111214]/20 rounded-lg">
              Claude AI
            </div>
            <div className="flex items-center justify-center h-10 border border-white/5 bg-[#111214]/20 rounded-lg">
              Postgres
            </div>
            <div className="flex items-center justify-center h-10 border border-white/5 bg-[#111214]/20 rounded-lg">
              Tailwind
            </div>
            <div className="flex items-center justify-center h-10 border border-white/5 bg-[#111214]/20 rounded-lg">
              React
            </div>
            <div className="flex items-center justify-center h-10 border border-white/5 bg-[#111214]/20 rounded-lg">
              Framer
            </div>
            <div className="flex items-center justify-center h-10 border border-white/5 bg-[#111214]/20 rounded-lg">
              NextJS
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
