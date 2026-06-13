"use client";

import { COMMERCE_SECTION_TITLE, COMMERCE_SECTION_SUBTITLE, COMMERCE_FEATURES } from "../../data/commerce-content";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function CommerceSection() {
  return (
    <section className="relative py-24 bg-[#0A0A0B] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title Area */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-[#22D3EE] uppercase block">
            Real-world Trade
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {COMMERCE_SECTION_TITLE}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            {COMMERCE_SECTION_SUBTITLE}
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COMMERCE_FEATURES.map((feature, idx) => (
            <Card
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#111214]/40 p-5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/15 hover:bg-[#111214]/60"
            >
              <CardHeader className="p-0 flex flex-row items-center gap-3 mb-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <CardTitle className="text-xs font-bold text-white uppercase tracking-wider">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
