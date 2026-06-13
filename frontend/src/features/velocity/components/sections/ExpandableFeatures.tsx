"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Server, ShieldCheck, Terminal, ArrowRight } from "lucide-react";
import StockoutRiskCard from "../dashboard/StockoutRiskCard";
import CreditRiskCard from "../dashboard/CreditRiskCard";
import DemandForecastCard from "../dashboard/DemandForecastCard";
import AIReasoningTimeline from "../dashboard/AIReasoningTimeline";

interface FeatureBlock {
  id: string;
  title: string;
  tag: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  accentClass: string;
}

export default function ExpandableFeatures() {
  const [activeId, setActiveId] = useState("inventory");

  const features: FeatureBlock[] = [
    {
      id: "inventory",
      title: "Inventory Intelligence",
      tag: "Predictive Stocking",
      description:
        "Velocity monitors transaction logs hourly to forecast demand spikes, evaluate run-rates, and trigger reorders 4 days before a stockout occurs.",
      icon: ShieldAlert,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      accentClass: "bg-cyan-500",
    },
    {
      id: "warehouse",
      title: "Warehouse Network",
      tag: "Multi-Node Logistics",
      description:
        "Coordinate inventory across remote depot networks, city showrooms, and mobile delivery fleets automatically without spreadsheet syncing.",
      icon: Server,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      accentClass: "bg-emerald-500",
    },
    {
      id: "credit",
      title: "Credit Commerce Ready",
      tag: "Margin Protection",
      description:
        "Calculate customer late-payment risks and automatically place high-risk ledgers on proactive credit holds before dispatch routing.",
      icon: ShieldCheck,
      color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
      accentClass: "bg-violet-500",
    },
    {
      id: "copilot",
      title: "Autonomous AI Copilot",
      tag: "Operations Agent",
      description:
        "Query account statuses, draft purchase orders matching active contracts, and authorize stock transfers via secure natural language prompts.",
      icon: Terminal,
      color: "text-lime-400 bg-lime-500/10 border-lime-500/20",
      accentClass: "bg-lime-500",
    },
  ];

  return (
    <section className="relative py-24 bg-[#0A0A0B] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title Area */}
        <div className="max-w-3xl mb-16 space-y-4">
          <span className="text-[10px] font-bold tracking-widest text-lime-400 uppercase block">
            System Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Expandable Operations Hub.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
            Click on any operational engine below to view how Velocity turns transaction logs into live dashboard outcomes.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Expandable Accordion List (Left) */}
          <div className="lg:col-span-6 space-y-3.5">
            {features.map((f) => {
              const Icon = f.icon;
              const isActive = f.id === activeId;

              return (
                <div
                  key={f.id}
                  onClick={() => setActiveId(f.id)}
                  className={`cursor-pointer rounded-xl border p-4.5 transition-all duration-300 backdrop-blur-md text-left relative overflow-hidden ${
                    isActive
                      ? "border-white/15 bg-[#111214]/65"
                      : "border-white/5 bg-[#111214]/30 hover:border-white/10 hover:bg-[#111214]/40"
                  }`}
                >
                  {/* Left accent border */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBorder"
                      className={`absolute left-0 top-0 bottom-0 w-1 ${f.accentClass}`}
                    />
                  )}

                  <div className="flex items-center gap-3.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${f.color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-zinc-500">
                        {f.tag}
                      </span>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        {f.title}
                      </h4>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-xs text-zinc-400 leading-relaxed font-normal">
                          {f.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Contextual Visual Mockup (Right) */}
          <div className="lg:col-span-6 rounded-2xl border border-white/8 bg-[#111214]/40 p-5 md:p-6 backdrop-blur-xl relative min-h-[340px] flex items-center justify-center">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-lime-500/5 blur-3xl pointer-events-none" />

            <div className="w-full">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block mb-4 text-center">
                Live Console Output // Active Node: {activeId.toUpperCase()}
              </span>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeId}
                  initial={{ opacity: 0, scale: 0.96, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {activeId === "inventory" && <StockoutRiskCard />}
                  {activeId === "warehouse" && <DemandForecastCard />}
                  {activeId === "credit" && <CreditRiskCard />}
                  {activeId === "copilot" && <AIReasoningTimeline />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
