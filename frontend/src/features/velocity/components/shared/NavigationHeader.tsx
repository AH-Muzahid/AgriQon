"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { MARKETING_ROUTES } from "../../constants/marketing.constants";
import ArchitecturePreview from "./ArchitecturePreview";

export default function NavigationHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { title: "Inventory Intelligence", desc: "Real-time inventory visibility and stock control." },
    { title: "Sales & Distribution", desc: "Orders, invoicing and customer management." },
    { title: "Warehouse Operations", desc: "Multi-location inventory and transfers." },
    { title: "Accounting & Finance", desc: "Payments, expenses and financial reporting." },
    { title: "AI Copilot", desc: "Ask questions and automate operations." },
    { title: "Team & Permissions", desc: "Enterprise RBAC and access management." },
  ];

  const architectureLayers = [
    { title: "Operational Foundation", desc: "Real-time ledger audit logs and transaction engine." },
    { title: "System of Intelligence", desc: "Background neural model for reorder forecasts." },
    { title: "System of Action", desc: "Proactive recommendations and natural language query control." },
  ];

  const solutions = ["Distributors", "Trading Companies", "Wholesale Businesses", "Multi-Warehouse Operations", "Import & Export Businesses"];
  const resources = ["Documentation", "API", "Security", "Blog", "Case Studies"];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/10 bg-black/60 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-10 flex items-center justify-between">
        {/* Left Side: Brand Logo */}
        <Link href={MARKETING_ROUTES.home} className="flex items-center gap-2 group shrink-0">
          <span className="h-6 w-6 rounded-full bg-lime-500 flex items-center justify-center font-bold text-xs text-black shadow-lg shadow-lime-500/20">
            V
          </span>
          <span className="font-sans text-lg font-bold tracking-tight text-white transition-colors group-hover:text-lime-400">
            Velocity
          </span>
        </Link>

        {/* Center: shadcn Navigation Menu */}
        <nav className="hidden md:flex items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {/* Features */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-zinc-400 hover:text-white hover:bg-white/5 bg-transparent data-popup-open:bg-transparent">
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-[#111214] border border-white/10 p-5 rounded-xl w-[550px] md:w-[600px]">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-4 border-b border-white/5 pb-2">
                    Everything needed to run modern distribution businesses.
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    {features.map((f, i) => (
                      <NavigationMenuLink key={i} className="hover:bg-white/5 p-2 rounded-lg block text-left group">
                        <span className="text-xs font-bold text-white block group-hover:text-lime-400 transition-colors">
                          {f.title}
                        </span>
                        <span className="text-[10px] text-zinc-500 block leading-normal mt-0.5">
                          {f.desc}
                        </span>
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Architecture */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-zinc-400 hover:text-white hover:bg-white/5 bg-transparent">
                  Architecture
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-[#111214] border border-white/10 p-5 rounded-xl w-[500px] md:w-[580px] flex gap-5">
                  <div className="flex-1 space-y-4">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-2">
                      Built on three layers of intelligence.
                    </span>
                    <div className="space-y-3.5">
                      {architectureLayers.map((layer, i) => (
                        <div key={i} className="text-left">
                          <span className="text-xs font-bold text-white block hover:text-lime-400 cursor-pointer transition-colors">
                            {layer.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 block leading-normal">
                            {layer.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ArchitecturePreview />
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Solutions */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-zinc-400 hover:text-white hover:bg-white/5 bg-transparent">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-[#111214] border border-white/10 p-4 rounded-xl w-52">
                  <div className="flex flex-col gap-1.5">
                    {solutions.map((s, i) => (
                      <NavigationMenuLink key={i} className="hover:bg-white/5 p-2 rounded-lg text-left text-xs font-bold text-white hover:text-lime-400 block transition-colors">
                        {s}
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Pricing (Direct link style) */}
              <NavigationMenuItem>
                <Link href={MARKETING_ROUTES.demo} legacyBehavior passHref>
                  <NavigationMenuLink className="text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 px-4 py-2 rounded-md text-sm font-medium">
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              {/* Resources */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-zinc-400 hover:text-white hover:bg-white/5 bg-transparent">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-[#111214] border border-white/10 p-4 rounded-xl w-52">
                  <div className="flex flex-col gap-1.5">
                    {resources.map((r, i) => (
                      <NavigationMenuLink key={i} className="hover:bg-white/5 p-2 rounded-lg text-left text-xs font-bold text-white hover:text-lime-400 block transition-colors">
                        {r}
                      </NavigationMenuLink>
                    ))}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right Side: CTA Group */}
        <div className="hidden md:flex items-center gap-4">
          <Link href={MARKETING_ROUTES.demo}>
            <Button variant="ghost" className="text-xs font-bold text-zinc-400 hover:text-white hover:bg-transparent">
              Login
            </Button>
          </Link>

          <Link href={MARKETING_ROUTES.demo} className="relative group/btn">
            <div className="absolute -inset-0.5 rounded-full bg-lime-500/20 opacity-0 blur-md transition-all group-hover/btn:opacity-100" />
            <Button className="relative rounded-full bg-lime-500 hover:bg-lime-400 text-black px-5 h-9 font-extrabold text-xs flex items-center gap-1">
              Request Enterprise Demo
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className="md:hidden shrink-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 p-0 text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0A0A0B] border-l border-white/10 text-white flex flex-col justify-between p-6">
              <SheetTitle className="text-left font-sans text-lg font-bold tracking-tight text-white mb-6">
                Velocity Navigation
              </SheetTitle>
              <nav className="flex flex-col gap-5 flex-1 pt-4 text-left">
                {["Features", "Architecture", "Solutions", "Pricing", "Resources"].map((label, idx) => (
                  <Link
                    key={idx}
                    href={MARKETING_ROUTES.demo}
                    className="text-lg font-bold text-zinc-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="border-t border-white/10 pt-5 space-y-4">
                <Link href={MARKETING_ROUTES.demo} className="w-full">
                  <Button className="w-full rounded-full bg-lime-500 hover:bg-lime-400 text-black h-11 font-extrabold text-xs flex items-center justify-center gap-1.5">
                    Request Enterprise Demo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
