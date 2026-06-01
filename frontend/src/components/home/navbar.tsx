"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, ChevronDown, Gift, Menu, Search, ShoppingCart, Sprout, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SmartSearch } from "@/components/ui/smart-search";
import { useCart } from "@/context/cart-context";

const topLinks = [
  { label: "আম বাজার", href: "/shop?category=Fruits", icon: Sprout, highlight: true },
  { label: "সব পণ্য", href: "/shop" },
  { label: "সিজনাল অফার", href: "/shop?category=Fruits", icon: Gift },
  { label: "AI সহায়তা", href: "/dashboard/ai-assistant", icon: Bot },
];

const categoryLinks = [
  { label: "আম", href: "/shop?category=Fruits" },
  { label: "সবজি", href: "/shop?category=Vegetables" },
  { label: "ধান ও চাল", href: "/shop?category=Grains" },
  { label: "দুধ ও ডিম", href: "/shop?category=Dairy%20%26%20Eggs" },
  { label: "মাছ ও পোল্ট্রি", href: "/shop?category=Meat%20%26%20Poultry" },
  { label: "মধু", href: "/shop?category=Organic%20Honey" },
  { label: "বীজ ও বাদাম", href: "/shop?category=Seeds%20%26%20Nuts" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();

  if (pathname?.startsWith("/dashboard")) return null;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="relative z-50 w-full bg-white font-sans">
      <SmartSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className="bg-[var(--brand-leaf-dark)] text-white">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-3 sm:px-5 lg:h-[76px] lg:gap-5 lg:px-8">
          <button
            className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/90 lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link href="/" className="flex min-w-fit items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full border border-white/45 text-[var(--brand-paddy)] lg:size-10">
              <ShoppingCart className="size-[18px] lg:size-5" />
            </div>
            <div className="leading-none">
              <p className="text-xl font-extrabold tracking-tight lg:text-2xl">
                <span className="text-[var(--brand-paddy)]">Agri</span>Qon
              </p>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.28em] text-white/55 lg:text-[9px]">
                Krishi Market
              </p>
            </div>
          </Link>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="hidden h-11 min-w-[260px] max-w-[520px] flex-1 items-center gap-3 rounded-full border border-white/10 bg-white/14 px-4 text-left text-sm font-medium text-white/82 transition hover:bg-white/18 lg:flex"
          >
            <Search className="size-5 text-white/58" />
            <span className="truncate">Search crops, seeds, tools...</span>
            <span className="ml-auto rounded-md border border-white/12 px-2 py-0.5 text-[11px] text-white/45">
              Ctrl K
            </span>
          </button>

          <nav className="ml-auto hidden items-center gap-4 text-sm font-semibold xl:gap-6 lg:flex">
            {topLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={
                  link.highlight
                    ? "flex items-center gap-1.5 text-[var(--brand-paddy)] transition hover:text-white"
                    : "flex items-center gap-1.5 text-white/86 transition hover:text-[var(--brand-paddy)]"
                }
              >
                {link.icon ? <link.icon className="size-4" /> : null}
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/cart"
            className="relative ml-auto flex size-10 items-center justify-center rounded-full border border-white/24 text-white/90 transition hover:border-[var(--brand-paddy)] hover:text-[var(--brand-paddy)] lg:ml-0 lg:size-11"
            aria-label="Cart"
          >
            <ShoppingCart className="size-5" />
            <AnimatePresence>
              {cartCount > 0 ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-[var(--brand-harvest)] text-[11px] font-bold text-white"
                >
                  {cartCount}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </Link>

          <Link
            href="/auth/login"
            className="hidden size-11 items-center justify-center rounded-full border border-white/24 text-white/90 transition hover:border-[var(--brand-paddy)] hover:text-[var(--brand-paddy)] sm:flex"
            aria-label="Account"
          >
            <UserRound className="size-5" />
          </Link>
        </div>
      </div>

      <div className="border-b border-[#e8ece8] bg-white/96 shadow-[0_1px_0_rgba(15,79,58,0.03)]">
        <div className="no-scrollbar mx-auto flex h-11 max-w-7xl items-center gap-1.5 overflow-x-auto px-2 text-[13px] font-medium text-[var(--brand-ink)] sm:px-5 lg:h-12 lg:gap-2 lg:px-8 lg:text-sm">
          {categoryLinks.map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-2 transition hover:bg-[var(--brand-leaf-soft)] hover:text-[var(--brand-leaf)] lg:px-3"
            >
              {category.label}
              <ChevronDown className="size-3.5 text-[#7d8a84]" />
            </Link>
          ))}
        </div>
      </div>

      <div className="border-b border-[#e8ece8] bg-white px-3 py-2.5 lg:hidden">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex h-11 w-full items-center gap-3 rounded-full bg-[#f3f6f4] px-4 text-left text-sm font-medium text-[#66756e]"
        >
          <Search className="size-[18px]" />
          Search crops, seeds, tools...
        </button>
      </div>

      {mobileOpen ? (
        <div className="absolute left-0 top-full w-full border-b border-[#e5e7eb] bg-white shadow-xl lg:hidden">
          <div className="space-y-2 px-4 py-4">
            {topLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[#f9fafb]"
                onClick={() => setMobileOpen(false)}
              >
                {link.icon ? <link.icon className="size-5 text-[var(--brand-harvest)]" /> : null}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
