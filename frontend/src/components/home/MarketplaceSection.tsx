"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui"

const products = [
  {
    id: "1",
    name: "Premium Maize Seeds",
    category: "Seeds",
    price: 2500,
    unit: "/kg",
    rating: 4.8,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    name: "Organic Fertilizer 50kg",
    category: "Fertilizers",
    price: 4500,
    unit: "/bag",
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: "Drip Irrigation Kit",
    category: "Irrigation",
    price: 12000,
    unit: "/set",
    rating: 4.9,
    reviews: 56,
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    name: "Garden Tools Set",
    category: "Machinery",
    price: 3500,
    unit: "/set",
    rating: 4.5,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
  },
]

export function MarketplaceSection() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <section className="market-section">
      <div className="section-heading">
        <h2>Featured Products</h2>
        
        <div className="segmented-control">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("all")}
          >
            All
          </Button>
          <Button
            variant={activeTab === "seeds" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("seeds")}
          >
            Seeds
          </Button>
          <Button
            variant={activeTab === "fertilizers" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("fertilizers")}
          >
            Fertilizers
          </Button>
          <Button
            variant={activeTab === "machinery" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("machinery")}
          >
            Machinery
          </Button>
        </div>
      </div>
      
      <div className="product-grid">
        {products.map((product) => (
          <Card key={product.id} className="product-card overflow-hidden">
            <div className="relative aspect-4/3">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <CardContent className="product-body">
              <span className="product-meta">{product.category}</span>
              <CardTitle className="product-title">{product.name}</CardTitle>
              <p className="text-muted-foreground text-sm">
                Premium quality {product.category.toLowerCase()} for optimal yields
              </p>
            </CardContent>
            <CardFooter className="product-footer">
              <div>
                <strong className="text-primary">
                  ₦{product.price.toLocaleString()}
                  <span className="text-muted-foreground font-normal">
                    {product.unit}
                  </span>
                </strong>
              </div>
              <div className="rating-row">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{product.rating}</span>
                <a href="#" className="text-link">
                  ({product.reviews})
                </a>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <Button variant="outline" size="lg">
          View All Products
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </section>
  )
}
