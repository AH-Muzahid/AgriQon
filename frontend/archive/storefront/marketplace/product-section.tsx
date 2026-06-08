import { cropDeals, featuredProducts } from "./data";
import { MarketplaceProductCard } from "./product-card";
import { SectionHeader } from "./section-header";

export function ProductSection() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-9 sm:px-5 md:py-12 lg:px-8">
      <SectionHeader
        eyebrow="ম্যাঙ্গো ফোকাস"
        title="সিজনের জনপ্রিয় আম ও পাইকারি লট"
        action="সব পণ্য দেখুন"
      />
      <div className="no-scrollbar mb-7 flex gap-3 overflow-x-auto md:grid md:grid-cols-4 lg:grid-cols-7">
        {cropDeals.map((item) => (
          <div
            key={item.title}
            className="min-w-[145px] rounded-lg border border-[#e5e7eb] bg-white p-4 transition hover:border-[var(--brand-harvest)] hover:shadow-lg hover:shadow-slate-950/5 md:min-w-0"
          >
            <item.icon className="mb-4 size-7 text-[var(--brand-river)]" />
            <p className="font-black text-[var(--brand-ink)]">{item.title}</p>
            <p className="mt-1 text-xs font-bold text-[#667085]">{item.count}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {featuredProducts.map((product) => (
          <MarketplaceProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
