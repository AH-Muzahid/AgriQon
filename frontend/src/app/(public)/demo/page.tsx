"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { COMPANY_NAME, MARKETING_ROUTES } from "@/features/velocity/constants/marketing.constants";

export default function DemoQualificationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    industry: "distribution",
    teamSize: "10-50",
    warehousesCount: "2-5",
    revenueRange: "৳10M-৳50M",
    currentSystem: "Excel",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B] p-4 font-sans text-white">
        <div className="max-w-md w-full rounded-2xl border border-white/8 bg-[#111214]/60 p-8 backdrop-blur-xl text-center space-y-6 relative">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
          
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-black tracking-tight">Deployment Requested</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Thank you, <span className="text-white font-semibold">{formData.fullName}</span>. An integration engineer will contact you at <span className="text-white font-semibold">{formData.email}</span> within 2 hours to coordinate the secure migration flow for <span className="text-white font-semibold">{formData.businessName}</span>.
          </p>

          <div className="rounded-lg bg-zinc-900/60 p-4 border border-white/5 space-y-2.5 text-left font-mono text-[10px]">
            <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest block font-sans">
              System Operations Status
            </span>
            <div className="flex justify-between text-zinc-300">
              <span>Instance provisioned:</span>
              <span className="text-emerald-400">PENDING APPROVAL</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Database sandbox:</span>
              <span className="text-zinc-500">AWAITING SETUP</span>
            </div>
          </div>

          <Link
            href={MARKETING_ROUTES.home}
            className="inline-flex w-full h-10 items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-bold text-black hover:bg-zinc-200 transition-all"
          >
            Return to Operating System Overview
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Home */}
      <div className="max-w-2xl w-full mx-auto mb-8">
        <Link
          href={MARKETING_ROUTES.home}
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Overview
        </Link>
      </div>

      <div className="max-w-2xl w-full mx-auto rounded-2xl border border-white/8 bg-[#111214]/40 p-6 md:p-10 backdrop-blur-xl space-y-8 relative">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            <Sparkles className="h-3 w-3" />
            Enterprise Onboarding
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
            Deploy {COMPANY_NAME} in Your Enterprise
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Provide details about your operations. An integration expert will construct a tailored deployment specification for your business.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-zinc-350">
          {/* Double column inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Full Name
              </label>
              <input
                required
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214]/60 px-3 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
                placeholder="Rahman Khan"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Business Name
              </label>
              <input
                required
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214]/60 px-3 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
                placeholder="Khan Distribution Ltd"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Work Email
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214]/60 px-3 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
                placeholder="rahman@khan.com"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Phone Number
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214]/60 px-3 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
                placeholder="+880 17XX XXXXXX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214] px-2 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
              >
                <option value="distribution">Distribution</option>
                <option value="trading">Trading / Import-Export</option>
                <option value="wholesale">Wholesale</option>
                <option value="manufacturing">Logistics / Warehouse</option>
                <option value="other">Other Commerce</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Warehouses Count
              </label>
              <select
                value={formData.warehousesCount}
                onChange={(e) => setFormData({ ...formData, warehousesCount: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214] px-2 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
              >
                <option value="1">1 Warehouse</option>
                <option value="2-5">2 to 5 Warehouses</option>
                <option value="6-10">6 to 10 Warehouses</option>
                <option value="10+">10+ Warehouses</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Current System
              </label>
              <select
                value={formData.currentSystem}
                onChange={(e) => setFormData({ ...formData, currentSystem: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214] px-2 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
              >
                <option value="Excel">Excel / Google Sheets</option>
                <option value="Desktop Software">Desktop Legacy Software</option>
                <option value="Odoo">Odoo</option>
                <option value="ERPNext">ERPNext</option>
                <option value="Zoho">Zoho</option>
                <option value="SAP">SAP</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Team Size
              </label>
              <select
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214] px-2 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
              >
                <option value="1-10">1 to 10 people</option>
                <option value="10-50">10 to 50 people</option>
                <option value="50-200">50 to 200 people</option>
                <option value="200+">200+ people</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1.5 font-bold">
                Monthly Revenue Range
              </label>
              <select
                value={formData.revenueRange}
                onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })}
                className="w-full h-10 rounded-lg border border-white/8 bg-[#111214] px-2 text-xs text-white focus:border-cyan-400 focus:outline-none transition-all"
              >
                <option value="Under ৳10M">Under ৳10M</option>
                <option value="৳10M-৳50M">৳10M to ৳50M</option>
                <option value="৳50M-৳200M">৳50M to ৳200M</option>
                <option value="৳200M+">৳200M+</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-lg bg-lime-500 font-extrabold text-black text-xs transition-all hover:bg-lime-400 active:translate-y-px mt-4"
          >
            Submit Onboarding Request
          </button>
        </form>
      </div>
    </div>
  );
}
