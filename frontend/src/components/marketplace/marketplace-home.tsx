import { HeroShowcase } from "./hero-showcase";
import { ProductSection } from "./product-section";
import { ServiceStrip } from "./service-strip";

export function MarketplaceHome() {
  return (
    <main className="bg-[var(--brand-cream)] pb-16">
      <HeroShowcase />
      <ServiceStrip />
      <ProductSection />
    </main>
  );
}
