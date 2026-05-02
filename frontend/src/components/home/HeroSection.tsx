"use client"

import Link from "next/link"
import { Search, Sprout } from "lucide-react"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"

export function HeroSection() {
  return (
    <section className="hero-shell">
      <header className="site-header">
        <Link href="/" className="brand-mark">
          <span className="brand-icon">
            <Sprout />
          </span>
          Agriqon
        </Link>
        
        <nav className="top-nav">
          <Link href="/home">Home</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
        </nav>
        
        <div className="header-actions">
          <Link href="/auth/login" className="header-action">
            Sign In
          </Link>
          <Link href="/auth/signup" className="header-action">
            Get Started
          </Link>
        </div>
      </header>
      
      <div className="hero-content">
        <span className="eyebrow">AgriTech Marketplace</span>
        <h1>Smart Farming Solutions</h1>
        <p className="hero-copy">
          Connect with verified agro-dealers, access AI-powered crop advice, 
          and discover quality agricultural products—all in one platform.
        </p>
        
        <div className="search-dock">
          <Input 
            placeholder="Search products, services, or vendors..." 
            className="bg-background border-input"
          />
          <select className="bg-background border-input">
            <option value="">All Categories</option>
            <option value="seeds">Seeds & Planting</option>
            <option value="fertilizers">Fertilizers</option>
            <option value="machinery">Farm Machinery</option>
            <option value="pesticides">Pesticides</option>
            <option value="irrigation">Irrigation</option>
          </select>
          <Button size="lg" className="bg-primary text-primary-foreground">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
        <div className="hero-metrics">
          <div>
            <strong>10K+</strong>
            <span>Active Products</span>
          </div>
          <div>
            <strong>500+</strong>
            <span>Verified Dealers</span>
          </div>
          <div>
            <strong>50K+</strong>
            <span>Happy Farmers</span>
          </div>
          <div>
            <strong>AI</strong>
            <span>Smart Assistant</span>
          </div>
        </div>
      </div>
    </section>
  )
}
