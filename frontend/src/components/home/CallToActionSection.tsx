"use client"

import Link from "next/link"
import { Sprout, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui"

export function CallToActionSection() {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <span className="section-kicker">Get Started</span>
        <h2>Ready to Transform Your Farm?</h2>
        <p>
          Join thousands of farmers already using AgriQon to grow smarter.
        </p>
        
        <div className="cta-buttons">
          <Link href="/auth/signup">
            <Button size="lg" className="cta-primary">
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/marketplace">
            <Button variant="outline" size="lg" className="cta-secondary">
              Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>
      
      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-icon">
            <Sprout />
          </span>
          Agriqon
        </div>
        
        <nav className="footer-nav">
          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/services">Services</Link>
            <Link href="/pricing">Pricing</Link>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <Link href="/about">About</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <Link href="/help">Help Center</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/docs">Documentation</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/refund">Refund Policy</Link>
          </div>
        </nav>
        
        <div className="footer-bottom">
          <p>&copy; 2024 AgriQon. All rights reserved.</p>
        </div>
      </footer>
    </section>
  )
}
