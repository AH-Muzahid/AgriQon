"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bannerHighlights, heroSlides, sidePromos } from "./data";

export function HeroShowcase() {
  const hero = heroSlides[0];

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-5 md:py-8 lg:px-8">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,2.35fr)_minmax(300px,0.95fr)] lg:gap-5">
        <div className="relative overflow-hidden rounded-lg bg-[var(--brand-mist)] shadow-sm">
          <Link
            href="/shop?category=%E0%A6%86%E0%A6%AE"
            className="relative block aspect-[16/10] min-h-[210px] sm:aspect-[16/7] lg:aspect-[16/8]"
            aria-label="Mango season banner"
          >
            <Image
              src={hero.image}
              alt={hero.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 96vw, 66vw"
            />
          </Link>

          <button className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--brand-ink)] shadow-sm transition hover:bg-white md:size-10">
            <ChevronLeft className="size-5" />
          </button>
          <button className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--brand-ink)] shadow-sm transition hover:bg-white md:size-10">
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className={dot === 0 ? "h-2 w-7 rounded-full bg-[var(--brand-paddy)]" : "size-2 rounded-full bg-white"}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-5">
          {sidePromos.map((promo) => (
            <Link
              href="/shop?category=%E0%A6%86%E0%A6%AE"
              key={promo.title}
              className="relative block aspect-[16/10] min-h-[120px] overflow-hidden rounded-lg bg-[var(--brand-mist)] shadow-sm lg:min-h-[190px]"
              aria-label={promo.title}
            >
              <Image
                src={promo.image}
                alt={promo.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 48vw, 28vw"
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {bannerHighlights.map((item) => (
          <div
            key={item}
            className="rounded-lg border border-brand-soft bg-white px-4 py-3 text-center text-sm font-semibold text-[var(--brand-leaf)] shadow-sm"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
