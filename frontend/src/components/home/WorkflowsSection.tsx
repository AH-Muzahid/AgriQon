"use client"

import { Package, Truck, Shield, Headphones } from "lucide-react"
import { Card, CardContent } from "@/components/ui"

const workflows = [
  {
    step: "01",
    title: "Browse Products",
    description: "Explore our curated marketplace of verified agricultural products from trusted dealers.",
    icon: Package,
  },
  {
    step: "02",
    title: "Place Order",
    description: "Add items to cart and complete secure payment through our platform.",
    icon: Truck,
  },
  {
    step: "03",
    title: "Verified Delivery",
    description: "Receive quality-checked products delivered to your farm or pickup location.",
    icon: Shield,
  },
{
    step: "04",
    title: "Support",
    description: "Get ongoing support from our agricultural experts whenever you need help.",
    icon: Headphones,
  },
]

export function WorkflowsSection() {
  return (
    <section className="workflow-section">
      <div className="section-heading">
        <h2>How It Works</h2>
      </div>
      
      <div className="workflow-grid">
        {workflows.map((workflow, index) => (
          <Card key={index} className="workflow-card">
            <CardContent>
              <span className="section-kicker">{workflow.step}</span>
              <h3 className="text-2xl font-bold mt-2">{workflow.title}</h3>
              <p className="text-muted-foreground mt-2">
                {workflow.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
