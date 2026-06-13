"use client";

import Link from "next/link";
import { COMPANY_NAME, POSITIONING, MARKETING_ROUTES } from "../../constants/marketing.constants";

export default function FooterSection() {
  const currentYear = new Date().getFullYear();

  const links = {
    product: [
      { label: "Why Velocity", href: "#why-velocity" },
      { label: "The Problem", href: "#problem" },
      { label: "Architecture", href: "#architecture" },
      { label: "Simulated AI Command", href: "#command-center" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Enterprise", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact Sales", href: MARKETING_ROUTES.demo },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security", href: "#" },
    ],
  };

  return (
    <footer className="border-t border-white/8 bg-[#0A0A0B] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md bg-gradient-to-tr from-[#8B5CF6] to-[#22D3EE] flex items-center justify-center font-bold text-xs text-black">
                V
              </span>
              <span className="font-sans text-xl font-bold tracking-tight text-white">
                {COMPANY_NAME}
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              {POSITIONING}
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              {links.product.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {links.company.map((link, idx) => (
                <li key={idx}>
                  {link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {links.legal.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-600">
            &copy; {currentYear} {COMPANY_NAME} Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            All regional databases operational
          </div>
        </div>
      </div>
    </footer>
  );
}
