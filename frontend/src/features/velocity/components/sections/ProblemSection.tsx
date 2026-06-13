"use client";

import { PROBLEM_SECTION_TITLE, PROBLEM_SECTION_SUBTITLE, PROBLEM_CARDS } from "../../data/problem-content";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, EyeOff, Coins, ShieldAlert } from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  "whatsapp-void": MessageSquare,
  "warehouse-blindspot": EyeOff,
  "frozen-capital": Coins,
  "credit-trap": ShieldAlert,
};

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-24 bg-[#0A0A0B] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title Area */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-[#8B5CF6] uppercase block">
            System Failure
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {PROBLEM_SECTION_TITLE}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            {PROBLEM_SECTION_SUBTITLE}
          </p>
        </div>

        {/* 4 Premium Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEM_CARDS.map((card) => {
            const Icon = iconMap[card.id] || ShieldAlert;
            return (
              <Card
                key={card.id}
                className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#111214]/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-red-500/20 hover:bg-[#111214]/60"
              >
                <div className="absolute top-0 right-0 h-16 w-16 rounded-full bg-red-500/5 blur-xl pointer-events-none" />

                <CardHeader className="p-0 space-y-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition-colors group-hover:bg-red-500/20">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                    {card.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 mt-3 space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[50px]">
                    {card.description}
                  </p>

                  <div className="border-t border-white/5 pt-3">
                    <span className="text-base font-extrabold text-red-400 block tracking-tight">
                      {card.metric}
                    </span>
                    <span className="text-[10px] text-zinc-500 block leading-normal mt-0.5">
                      {card.consequence}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
