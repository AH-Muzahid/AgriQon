"use client"

import { useState } from "react"
import { Check, Mail } from "lucide-react"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubscribed(true)
    }
  }

  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <span className="section-kicker">Newsletter</span>
        <h2>Stay Updated</h2>
        <p>
          Get the latest agricultural news, farming tips, and product updates 
          delivered to your inbox.
        </p>
        
        {subscribed ? (
          <div className="newsletter-success">
            <Check className="w-5 h-5" />
            <span>Thank you for subscribing!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg">
              <Mail className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
