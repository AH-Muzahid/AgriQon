import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, ShoppingCart, Tag } from "lucide-react";

const deals = [
  {
    id: 1,
    discount: "20% OFF",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
    oldPrice: "AED 7.99",
    newPrice: "AED 5.99",
    title: "Fresh Tomatoes",
    subtitle: "1 kg - greenhouse harvest",
  },
  {
    id: 2,
    discount: "18% OFF",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80",
    oldPrice: "AED 5.99",
    newPrice: "AED 4.49",
    title: "Premium Bananas",
    subtitle: "1 kg - naturally sweet",
  },
  {
    id: 3,
    discount: "12% OFF",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80",
    oldPrice: "AED 22.99",
    newPrice: "AED 18.99",
    title: "Halal Chicken Breast",
    subtitle: "1 kg - fresh cut",
  },
];

export function PromoBanners() {
  return (
    <section className="w-full bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#d46b35]">
              Buyer specials
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#123a30] md:text-3xl">
              Sharp prices before the next delivery wave
            </h2>
          </div>
          <Link
            href="/deals"
            className="hidden items-center gap-2 text-sm font-black uppercase tracking-widest text-[#123a30] transition-all hover:gap-3 md:flex"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-lg bg-[#123a30] p-5 text-white shadow-sm">
            <div className="absolute inset-0 market-grid opacity-20" />
            <div className="relative z-10">
              <div className="mb-8 flex size-12 items-center justify-center rounded-lg bg-[#f5c542] text-[#123a30]">
                <Clock3 className="size-6" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#f5c542]">
                Closing soon
              </p>
              <h3 className="mt-2 text-3xl font-black leading-tight">
                Today&apos;s harvest window
              </h3>
              <div className="mt-8 grid grid-cols-3 gap-2">
                {[
                  ["09", "days"],
                  ["12", "hours"],
                  ["35", "mins"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-lg border border-white/15 bg-white/8 p-3 text-center">
                    <p className="text-xl font-black">{value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {deals.map((deal) => (
            <div
              key={deal.id}
              className="group overflow-hidden rounded-lg border border-[#dce8de] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#9cc6a9] hover:shadow-xl hover:shadow-emerald-950/6"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#eef5ef]">
                <Image
                  src={deal.image}
                  alt={deal.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 92vw, 25vw"
                />
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-[#9f3146] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                  <Tag className="size-3" />
                  {deal.discount}
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-[#8d9b94] line-through">
                    {deal.oldPrice}
                  </span>
                  <span className="text-lg font-black text-[#123a30]">
                    {deal.newPrice}
                  </span>
                </div>
                <h4 className="text-lg font-black text-[#123a30]">{deal.title}</h4>
                <p className="mt-1 text-sm font-medium text-[#66786f]">{deal.subtitle}</p>
                <button className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#edf7ef] text-sm font-black text-[#123a30] transition-colors group-hover:bg-[#123a30] group-hover:text-white">
                  <ShoppingCart className="size-4" />
                  Shop now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
