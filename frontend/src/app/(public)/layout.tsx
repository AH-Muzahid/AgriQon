import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velocity | AI Operating System for Distributors & Trading Businesses",
  description:
    "Transform inventory, warehouse, sales, and financial data into operational intelligence. A category-defining business intelligence and decision-making platform for modern commerce.",
  openGraph: {
    title: "Velocity | AI Operating System for Distributors & Trading Businesses",
    description:
      "Transform inventory, warehouse, sales, and financial data into operational intelligence.",
    type: "website",
    locale: "en_US",
    url: "https://velocity.trade",
    siteName: "Velocity",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velocity | AI Operating System for Distributors & Trading Businesses",
    description:
      "Transform inventory, warehouse, sales, and financial data into operational intelligence.",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Velocity",
    "url": "https://velocity.trade",
    "logo": "https://velocity.trade/logo.png",
    "sameAs": [],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Velocity",
    "operatingSystem": "All",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD",
    },
    "description":
      "AI-Powered Operating System for Distributors & Trading Businesses. Transforms operational data into business decisions.",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#FFFFFF] font-sans antialiased selection:bg-lime-500/30 selection:text-lime-400">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <div className="relative flex min-h-screen flex-col overflow-x-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute top-[20%] right-1/4 h-[600px] w-[600px] rounded-full bg-violet-500/5 blur-[150px]" />
        </div>
        <div className="relative z-10 flex flex-col flex-1">{children}</div>
      </div>
    </div>
  );
}
