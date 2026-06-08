"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bot, 
  ChevronDown, 
  Gift, 
  Menu, 
  Search, 
  ShoppingCart, 
  Sprout, 
  UserRound, 
  X,
  LayoutDashboard,
  LogOut,
  User
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SmartSearch } from "@/components/ui/smart-search";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";

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
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

          {user ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex h-11 items-center gap-2 rounded-full border border-white/24 bg-white/10 px-3 text-white transition hover:border-[var(--brand-paddy)] cursor-pointer"
              >
                <div className="flex size-7 items-center justify-center rounded-full bg-[var(--brand-paddy)] text-xs font-black uppercase text-white shadow-sm">
                  {user.name ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "U"}
                </div>
                <span className="hidden text-xs font-bold max-w-[80px] truncate md:inline-block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className={`size-3 text-white/60 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#e5ebe6] bg-white p-2.5 shadow-xl shadow-black/5 text-[var(--brand-ink)]"
                  >
                    <div className="px-3 py-2 border-b border-[#eef2ef] mb-1.5">
                      <p className="text-xs font-black truncate">{user.name}</p>
                      <p className="text-[10px] text-[#7d8a84] font-bold mt-0.5 truncate">{user.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {user.role === "SELLER" ? "বিক্রেতা (Seller)" : user.role === "ADMIN" ? "অ্যাডমিন (Admin)" : "গ্রাহক (Customer)"}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:bg-[#f3f7f4] hover:text-[#0f4f3a]"
                    >
                      <LayoutDashboard className="size-4 text-[#7d8a84]" />
                      <span>ড্যাশবোর্ড (Dashboard)</span>
                    </Link>

                    <Link
                      href="/dashboard/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:bg-[#f3f7f4] hover:text-[#0f4f3a]"
                    >
                      <User className="size-4 text-[#7d8a84]" />
                      <span>আমার প্রোফাইল</span>
                    </Link>

                    <div className="h-[1px] bg-[#eef2ef] my-1.5" />

                    <button
                      onClick={async () => {
                        setIsDropdownOpen(false);
                        await logout();
                        router.push("/");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      <span>লগআউট (Logout)</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden size-11 items-center justify-center rounded-full border border-white/24 text-white/90 transition hover:border-[var(--brand-paddy)] hover:text-[var(--brand-paddy)] sm:flex"
              aria-label="Account"
            >
              <UserRound className="size-5" />
            </Link>
          )}
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
        <div className="absolute left-0 top-full w-full border-b border-[#e5e7eb] bg-white shadow-xl lg:hidden" style={{ zIndex: 1000 }}>
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

            {user ? (
              <div className="border-t border-[#eef2ef] pt-3 mt-3 space-y-1">
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="flex size-9 items-center justify-center rounded-full bg-[var(--brand-paddy)] text-xs font-black uppercase text-white shadow-sm">
                    {user.name ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "U"}
                  </div>
                  <div>
                    <p className="text-xs font-black text-[var(--brand-ink)]">{user.name}</p>
                    <p className="text-[10px] text-[#7d8a84] font-bold">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[#f9fafb]"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="size-5 text-[#7d8a84]" />
                  <span>ড্যাশবোর্ড</span>
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[#f9fafb]"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="size-5 text-[#7d8a84]" />
                  <span>আমার প্রোফাইল</span>
                </Link>
                <button
                  onClick={async () => {
                    setMobileOpen(false);
                    await logout();
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                >
                  <LogOut className="size-5" />
                  <span>লগআউট</span>
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-3 rounded-md px-4 py-3 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[#f9fafb]"
                onClick={() => setMobileOpen(false)}
              >
                <UserRound className="size-5 text-[var(--brand-harvest)]" />
                <span>লগইন করুন</span>
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
