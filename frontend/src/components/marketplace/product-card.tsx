import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";

interface MarketplaceProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    vendor: string;
    image: string;
    badge: string;
  };
}

export function MarketplaceProductCard({ product }: MarketplaceProductCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[#e5e7eb] bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-950/8">
      <Link href={`/shop/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-[#f3f7e9]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 92vw, 25vw"
        />
        <span className="absolute left-3 top-3 rounded-md bg-[var(--brand-harvest)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
          {product.badge}
        </span>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-white/92 px-2 py-1 text-xs font-black text-[#101828]">
          <Star className="size-3 fill-[var(--brand-paddy)] text-[var(--brand-paddy)]" />
          4.8
        </span>
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="rounded-md bg-[#eef8ef] px-2 py-1 text-[10px] font-black text-[#178f5b]">
            {product.category}
          </span>
          <span className="truncate text-xs font-bold text-[#667085]">{product.vendor}</span>
        </div>
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-bold leading-snug text-[var(--brand-ink)] md:text-lg">
          {product.name}
        </h3>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#98a2b3]">দাম</p>
            <p className="text-xl font-bold text-[var(--brand-leaf)] md:text-2xl">
              ৳{product.price}
              <span className="ml-1 text-xs font-bold text-[#667085]">/ {product.unit}</span>
            </p>
          </div>
          <button className="flex size-11 items-center justify-center rounded-md bg-[var(--brand-leaf)] text-white transition hover:bg-[var(--brand-harvest)]">
            <ShoppingCart className="size-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
