import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  action?: string;
  href?: string;
}

export function SectionHeader({ eyebrow, title, action, href = "/shop" }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--brand-harvest)]">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[1.35rem] font-bold leading-snug text-[var(--brand-ink)] md:text-3xl">
          {title}
        </h2>
      </div>
      {action ? (
        <Link
          href={href}
          className="hidden items-center gap-2 text-sm font-black text-[var(--brand-leaf)] transition-all hover:gap-3 md:flex"
        >
          {action}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
