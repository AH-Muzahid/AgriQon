"use client";

import { ARCHITECTURE_TITLE, ARCHITECTURE_LAYERS } from "../../data/architecture-content";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield } from "lucide-react";

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-24 bg-[#0A0A0B] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Sticky Left Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 lg:h-fit space-y-6">
            <span className="text-[10px] font-bold tracking-widest text-[#22D3EE] uppercase block">
              Architectural Blueprints
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {ARCHITECTURE_TITLE}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed max-w-md">
              A modern enterprise stack built in three layers to separate basic data records from predictive analytics and direct action execution.
            </p>
            <div className="flex items-center gap-2 text-zinc-500 text-xs pt-4 border-t border-white/5">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span>Palantir-inspired layered data system</span>
            </div>
          </div>

          {/* Scrollable Right Panel */}
          <div className="lg:col-span-7 space-y-8">
            {ARCHITECTURE_LAYERS.map((layer) => (
              <Card
                key={layer.number}
                className="group relative overflow-hidden rounded-xl border border-white/8 bg-[#111214]/50 p-6 md:p-8 backdrop-blur-md transition-all duration-300 hover:border-cyan-500/15"
              >
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-cyan-500/3 blur-3xl pointer-events-none" />

                <CardHeader className="p-0 flex flex-row items-center gap-4 border-b border-white/5 pb-4 mb-4">
                  <span className="font-mono text-3xl font-black text-cyan-400/30">
                    {layer.number}
                  </span>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">
                      Layer {layer.number}
                    </span>
                    <CardTitle className="text-lg font-bold text-white">{layer.name}</CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-5">
                  <div>
                    <span className="text-xs font-semibold text-zinc-300 block mb-1">
                      {layer.subtitle}
                    </span>
                    <p className="text-xs text-zinc-500 leading-relaxed">{layer.caption}</p>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-3">
                      Subsystems Include
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {layer.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-zinc-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
