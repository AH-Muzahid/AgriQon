"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Mail, Phone, MapPin, ArrowRight, MessageCircle, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  // ... svg definition ...
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a4d3c] text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-[#facc15] to-emerald-500 opacity-40" />
      <div className="absolute top-0 left-1/4 w-px h-full bg-white/5 hidden lg:block" />
      <div className="absolute top-0 left-1/2 w-px h-full bg-white/5 hidden lg:block" />
      <div className="absolute top-0 left-3/4 w-px h-full bg-white/5 hidden lg:block" />
      
      <div className="absolute -top-24 -left-24 size-96 bg-emerald-500/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 size-[500px] bg-[#facc15]/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12 mb-20">
          {/* Brand & Mission */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center p-2 rounded-xl bg-white text-[#0a4d3c] shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                <ShoppingCart className="size-6 stroke-[2.5]" />
              </div>
              <span className="text-3xl font-black tracking-tighter">AgriQon</span>
            </Link>
            <p className="text-emerald-100/60 text-base leading-relaxed font-medium">
              Revolutionizing the agricultural landscape with AI-driven intelligence. We empower local farmers and deliver the purest harvest directly to your doorstep.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: MessageCircle, href: "#" },
                { icon: InstagramIcon, href: "#" },
                { icon: TwitterIcon, href: "#" },
                { icon: FacebookIcon, href: "#" }
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  className="size-11 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-xl hover:bg-[#facc15] hover:text-[#0a4d3c] hover:-translate-y-1 transition-all duration-300 border border-white/10"
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-black mb-8 text-[#facc15] tracking-tight uppercase text-xs">Navigation</h3>
            <ul className="space-y-5">
              {[
                { name: "Explore Marketplace", href: "/shop" },
                { name: "Our Certified Farmers", href: "/farmers" },
                { name: "Seasonal Harvest Deals", href: "/deals" },
                { name: "Sustainability Report", href: "/impact" },
                { name: "Global Logistics", href: "/delivery" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-emerald-100/70 hover:text-white hover:translate-x-2 transition-all inline-flex items-center gap-2 group text-sm font-semibold">
                    <div className="size-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-black mb-8 text-[#facc15] tracking-tight uppercase text-xs">Headquarters</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <MapPin className="size-5 text-[#facc15]" />
                </div>
                <span className="text-sm font-medium text-emerald-100/70 leading-relaxed">
                  AgriQon Innovation Center,<br />
                  Sustainability City, Abu Dhabi,<br />
                  United Arab Emirates
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Phone className="size-5 text-[#facc15]" />
                </div>
                <span className="text-sm font-medium text-emerald-100/70">+971 50 123 4567</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Mail className="size-5 text-[#facc15]" />
                </div>
                <span className="text-sm font-medium text-emerald-100/70">contact@agriqon.ai</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-black mb-8 text-[#facc15] tracking-tight uppercase text-xs">Stay Rooted</h3>
            <p className="text-sm text-emerald-100/70 mb-8 font-medium">
              Join 10,000+ conscious consumers receiving weekly harvest updates and AI-driven agricultural insights.
            </p>
            <form className="space-y-4">
              <div className="relative group">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-14 pr-14 focus:bg-white/10 focus:border-[#facc15]/50 transition-all rounded-2xl backdrop-blur-sm"
                />
                <button type="submit" className="absolute right-2 top-2 bottom-2 px-3 bg-[#facc15] text-[#0a4d3c] rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg">
                  <ArrowRight className="size-5" />
                </button>
              </div>
              <p className="text-[10px] text-emerald-100/30 font-medium">
                Protected by reCAPTCHA. <Link href="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link> applies.
              </p>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center lg:items-start gap-2">
            <p className="text-xs font-bold text-emerald-100/40 uppercase tracking-widest">&copy; {currentYear} AgriQon Marketplace</p>
            <p className="text-[10px] font-medium text-emerald-100/20 uppercase tracking-[0.2em]">Designed for the future of farming</p>
          </div>
          
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {["Terms", "Privacy", "Cookies", "Compliance", "Security"].map((text) => (
              <Link key={text} href={`/${text.toLowerCase()}`} className="text-xs font-bold text-emerald-100/40 hover:text-white transition-colors uppercase tracking-widest">
                {text}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <Globe className="size-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60">English (UAE)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
