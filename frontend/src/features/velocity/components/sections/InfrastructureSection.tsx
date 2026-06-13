"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Server, ShieldCheck, Cpu } from "lucide-react";

export default function InfrastructureSection() {
  const cards = [
    {
      title: "Multi-Warehouse Native",
      description:
        "Engineered for multi-node storage routing. Syncs regional warehouses, city depots, and mobile fleets in real time. Optimizes transfer logistics based on local demand run-rates.",
      icon: Server,
      color: "text-cyan-400 bg-cyan-500/10",
      accent: "cyan",
    },
    {
      title: "Credit Commerce Ready",
      description:
        "Protects margins in credit-heavy operations. Enforces real-time ledger audits, automated payment grace tracking, and neural credit assessments before orders route to dispatch.",
      icon: ShieldCheck,
      color: "text-violet-400 bg-violet-500/10",
      accent: "violet",
    },
    {
      title: "Designed for Emerging Markets",
      description:
        "Built for real-world resilience. Features intermittent internet fallback, lightweight mobile performance, and rapid sub-distributor onboarding interfaces.",
      icon: Cpu,
      color: "text-emerald-400 bg-emerald-500/10",
      accent: "emerald",
    },
  ];

  return (
    <section className="relative py-24 bg-[#0A0A0B] border-t border-white/5">
      <div className="absolute inset-0 bg-[#111214]/10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Area */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase block">
            System Infrastructure
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Built for Heavy-Duty Distribution Operations.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            Reliable, distributed, and fast. Built to scale across millions of weekly SKU operations.
          </p>
        </div>

        {/* 3 Large Grid Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Card
                key={idx}
                className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#111214]/40 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/15 hover:bg-[#111214]/60"
              >
                <div
                  className={`absolute top-0 right-0 h-24 w-24 rounded-full blur-2xl pointer-events-none ${
                    card.accent === "cyan"
                      ? "bg-cyan-500/5"
                      : card.accent === "violet"
                      ? "bg-violet-500/5"
                      : "bg-emerald-500/5"
                  }`}
                />

                <CardHeader className="p-0 space-y-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">
                    {card.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 mt-3">
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
