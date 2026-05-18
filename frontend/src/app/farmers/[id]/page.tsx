"use client";

import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { 
  MapPin, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Truck, 
  Leaf, 
  Calendar, 
  MessageSquare,
  Share2,
  ArrowRight
} from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";

// Mock farmer data
const FARMERS = {
  "1": {
    id: "1",
    name: "Zayed Farms",
    owner: "Ahmed Al-Zayed",
    location: "Al Ain, Abu Dhabi",
    joined: "March 2021",
    rating: 4.9,
    reviews: 128,
    verified: true,
    bio: "A third-generation family farm specializing in high-quality organic vegetables. We use sustainable irrigation techniques and natural fertilizers to produce the freshest tomatoes, cucumbers, and peppers in the region.",
    coverImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80",
    profileImage: "https://images.unsplash.com/photo-1560343060-c140a57e9904?w=400&q=80",
    certifications: ["Certified Organic", "Sustainable Water Usage", "Pesticide Free"],
    stats: [
      { label: "Products Sold", value: "2.4k+" },
      { label: "Happy Buyers", value: "850+" },
      { label: "Avg. Response", value: "15 min" }
    ],
    products: [
      {
        id: "1",
        name: "Fresh Red Tomatoes",
        category: "Vegetables",
        vendor: "Zayed Farms",
        location: "Al Ain",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
        tag: "Fresh Harvest",
        price: 12.50,
        unit: "kg",
      },
      {
        id: "5",
        name: "Crisp Green Cucumbers",
        category: "Vegetables",
        vendor: "Zayed Farms",
        location: "Al Ain",
        image: "https://images.unsplash.com/photo-1449333254728-aa92440182aa?w=800&q=80",
        price: 8.00,
        unit: "kg",
      },
      {
        id: "6",
        name: "Sweet Bell Peppers",
        category: "Vegetables",
        vendor: "Zayed Farms",
        location: "Al Ain",
        image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800&q=80",
        price: 15.00,
        unit: "500g",
      }
    ]
  }
};

type FarmerType = typeof FARMERS["1"];

export default function FarmerProfilePage() {
  const { id } = useParams();
  const farmer: FarmerType = (FARMERS as Record<string, FarmerType>)[id as string] || FARMERS["1"];

  return (
    <main className="min-h-screen bg-gray-50/30 pb-24">
      {/* Cover Section */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden">
        <Image 
          src={farmer.coverImage} 
          alt={farmer.name} 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        <div className="absolute bottom-6 right-6 flex gap-3">
          <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
            <Share2 className="size-4 mr-2" /> Share
          </Button>
          <Button className="bg-[#facc15] text-[#0a4d3c] hover:bg-[#eab308] border-none font-bold">
            <MessageSquare className="size-4 mr-2" /> Contact Farmer
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-2xl shadow-emerald-900/5">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative size-32 md:size-40 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-100">
              <Image 
                src={farmer.profileImage} 
                alt={farmer.owner} 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{farmer.name}</h1>
                {farmer.verified && (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold border border-emerald-100 self-center md:self-auto">
                    <CheckCircle2 className="size-4" />
                    Verified Farmer
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm font-medium text-gray-500">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-600" />
                  {farmer.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-emerald-600" />
                  Joined {farmer.joined}
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="size-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-900 font-bold ml-1">{farmer.rating}</span>
                  <span className="text-gray-400">({farmer.reviews} reviews)</span>
                </div>
              </div>

              <p className="text-gray-600 max-w-3xl text-lg leading-relaxed">
                {farmer.bio}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {farmer.certifications.map((cert) => (
                  <span key={cert} className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 px-4 py-1.5 rounded-xl text-xs font-bold border border-gray-100">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-gray-100">
            {farmer.stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-1">
                <div className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a4d3c] rounded-[2rem] p-8 text-white space-y-6 shadow-xl shadow-emerald-900/10">
            <h3 className="text-xl font-bold flex items-center gap-2 text-[#facc15]">
              <Truck className="size-5" />
              Shipping Info
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-bold opacity-60">Delivers To</div>
                <div className="font-medium">All Across Abu Dhabi & Dubai</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold opacity-60">Avg. Delivery</div>
                <div className="font-medium">Same Day (within 12h)</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold opacity-60">Minimum Order</div>
                <div className="font-medium">AED 50.00</div>
              </div>
            </div>
            <Button className="w-full bg-[#facc15] text-[#0a4d3c] hover:bg-white transition-colors font-black h-12 rounded-xl border-none">
              BUY DIRECTLY
            </Button>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Farm Standards</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <Leaf className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">100% Organic</div>
                  <div className="text-xs text-gray-500">No chemical pesticides</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Eco-Friendly</div>
                  <div className="text-xs text-gray-500">Sustainable farming</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Products */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">Available from {farmer.name}</h2>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="font-bold text-emerald-700">View All</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {farmer.products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Reviews Preview */}
          <div className="mt-16 bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900">Buyer Reviews</h2>
              <Button variant="outline" className="rounded-xl border-gray-200">
                Write a Review <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>

            <div className="space-y-6">
              {[1, 2].map((r) => (
                <div key={r} className="p-6 bg-gray-50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-gray-200 rounded-full" />
                      <div>
                        <div className="text-sm font-bold text-gray-900">Khalid Mansoor</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Verified Buyer</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="size-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm italic">
                    &quot;The tomatoes from Zayed Farms are the best I&apos;ve ever had in Abu Dhabi. Truly fresh and tastes like real homegrown produce. Highly recommend!&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
