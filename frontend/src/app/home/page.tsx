import {
  HeroSection,
  MarketplaceSection,
  AISearchSection,
  WorkflowsSection,
  FAQSection,
  NewsletterSection,
  CallToActionSection,
} from '@/components/home'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <MarketplaceSection />
      <AISearchSection />
      <WorkflowsSection />
      <FAQSection />
      <NewsletterSection />
      <CallToActionSection />
    </main>
  )
}
