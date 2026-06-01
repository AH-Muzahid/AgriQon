"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Plus,
  Minus,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface ProductCategory {
  id: string;
  name: string;
}

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  discount?: number;
  category?: ProductCategory;
  rating?: number;
  unit?: string;
  vendor?: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  images?: string[];
  discount?: number;
  category?: ProductCategory;
  unit?: string;
  vendor?: string;
  location?: string;
}

interface Review {
  userName?: string;
  rating?: number;
  comment?: string;
}

type TabType = "description" | "reviews" | "farmer";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "farmer">("description");

  const cartItem = cart.find((item) => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = isInWishlist(id as string);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getProduct<ProductDetail>(id as string);
        const productData = res.data;
        setProduct(productData);

        // Fetch related products
        if (productData.category) {
          const relatedRes = await apiClient.getItems<RelatedProduct[]>({ category: productData.category.name });
          setRelatedProducts(relatedRes.data.filter((p: RelatedProduct) => p.id !== id).slice(0, 4));
        }

        // Fetch reviews
        const reviewsRes = await apiClient.getReviews<Review[]>(id as string);
        setReviews(reviewsRes.data || []);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleUpdateQuantity = (newQty: number) => {
    if (!product) return;
    if (quantity === 0 && newQty > 0) {
      addToCart({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        image: product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e", 
        quantity: 1 
      });
    } else {
      updateQuantity(product.id, newQty);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Button onClick={() => router.push("/shop")}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdfc] min-h-screen pb-20">
      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#0a4d3c] transition-colors"
        >
          <ChevronLeft className="size-4" />
          Back to Marketplace
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Product Image Section */}
          <div className="space-y-4 sticky top-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-[2rem] overflow-hidden bg-white shadow-xl shadow-emerald-900/5 border border-emerald-100/20"
            >
              <Image
                src={product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.discount && (
                <div className="absolute top-6 left-6 bg-[#7d002e] text-white px-4 py-1.5 rounded-full text-sm font-black tracking-wider shadow-lg">
                  {product.discount}% OFF
                </div>
              )}
            </motion.div>
            
            {/* Thumbnail Gallery (Mockup) */}
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white border border-gray-100 overflow-hidden cursor-pointer hover:border-[#0a4d3c] transition-colors relative">
                   <Image
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e"}
                    alt={`${product.name} thumb ${i}`}
                    fill
                    className={`object-cover opacity-60 ${i === 0 ? "opacity-100 ring-2 ring-[#0a4d3c] ring-inset" : ""}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-emerald-50 text-[#0a4d3c] text-xs font-black uppercase tracking-widest rounded-full">
                  {product.category?.name || "Fresh Produce"}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="size-4 fill-[#facc15] text-[#facc15]" />
                  <span className="text-sm font-bold text-gray-900">{product.rating || "4.8"}</span>
                  <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-[1.1]">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#0a4d3c]">AED {Number(product.price).toFixed(2)}</span>
                    {product.discount && (
                      <span className="text-lg text-gray-400 line-through">AED {(Number(product.price) * (1 + product.discount/100)).toFixed(2)}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 font-medium mt-1">Per {product.unit || "kg"} • In Stock</span>
                </div>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {product.description || "Our farm-fresh produce is harvested at the peak of ripeness to ensure the best flavor and nutritional value. Directly sourced from local organic farms."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="flex items-center bg-gray-100 rounded-2xl p-1 shrink-0">
                  <button 
                    onClick={() => handleUpdateQuantity(Math.max(0, quantity - 1))}
                    className="size-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Minus className="size-5" />
                  </button>
                  <span className="w-12 text-center font-black text-xl text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => handleUpdateQuantity(quantity + 1)}
                    className="size-12 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <Plus className="size-5" />
                  </button>
                </div>
                
                <Button 
                  onClick={() => quantity === 0 && handleUpdateQuantity(1)}
                  className="flex-1 h-14 bg-[#0a4d3c] hover:bg-[#07382b] text-white text-lg font-black rounded-2xl shadow-xl shadow-emerald-900/20 gap-3 group"
                >
                  <ShoppingBag className="size-6 group-hover:scale-110 transition-transform" />
                  {quantity > 0 ? "In Cart" : "Add to Cart"}
                </Button>

                <button 
                  onClick={() => toggleWishlist({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e",
                    category: product.category?.name || "Fresh Produce",
                    vendor: product.vendor || "Local Farm"
                  })}
                  className={`size-14 flex items-center justify-center rounded-2xl border-2 transition-all ${
                    isWishlisted ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  <Heart className={`size-6 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* USP Section */}
              <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-8">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-[#0a4d3c]">
                    <Truck className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Free Shipping</h4>
                    <p className="text-xs text-gray-500">Orders over AED 500</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Organic Certified</h4>
                    <p className="text-xs text-gray-500">100% Non-GMO</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-4">
              <div className="flex gap-8 border-b border-gray-100 mb-8">
                {["description", "reviews", "farmer"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as TabType)}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${
                      activeTab === tab ? "text-[#0a4d3c]" : "text-gray-400"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 w-full h-1 bg-[#0a4d3c] rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px]">
                {activeTab === "description" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-emerald max-w-none text-gray-600"
                  >
                    <p>Harvested at 4:00 AM every morning to ensure you get the absolute freshest experience. Our {product.name} is grown using sustainable permaculture techniques that enrich the soil rather than depleting it.</p>
                    <ul className="mt-4 space-y-2">
                      <li className="flex items-center gap-2 font-medium"><div className="size-1.5 rounded-full bg-emerald-500" /> No synthetic pesticides used</li>
                      <li className="flex items-center gap-2 font-medium"><div className="size-1.5 rounded-full bg-emerald-500" /> Harvested and shipped within 24 hours</li>
                      <li className="flex items-center gap-2 font-medium"><div className="size-1.5 rounded-full bg-emerald-500" /> Rich in essential vitamins and antioxidants</li>
                    </ul>
                  </motion.div>
                )}
                
                {activeTab === "reviews" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {reviews.length > 0 ? (
                      reviews.map((review, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="size-10 rounded-full bg-gray-100" />
                                 <div>
                                    <h5 className="font-bold text-gray-900">{review.userName || "Customer"}</h5>
                                    <div className="flex gap-0.5">
                                       {Array.from({length: 5}).map((_, j) => (
                                          <Star key={j} className={`size-3 ${j < (review.rating || 5) ? "fill-[#facc15] text-[#facc15]" : "text-gray-200"}`} />
                                       ))}
                                    </div>
                                 </div>
                              </div>
                              <span className="text-xs text-gray-400 font-medium">2 days ago</span>
                           </div>
                           <p className="text-gray-600 text-sm">{review.comment || "Great product, very fresh and tasty!"}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                         <MessageSquare className="size-12 text-gray-300 mx-auto mb-4" />
                         <p className="text-gray-500 font-medium">No reviews yet. Be the first to try it!</p>
                         <Button variant="outline" className="mt-4 rounded-full">Write a Review</Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "farmer" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm"
                  >
                    <div className="relative size-32 rounded-3xl overflow-hidden shrink-0">
                       <Image src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200" alt="Farmer" fill className="object-cover" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-gray-900 mb-2">Farmer Rahim Uddin</h4>
                       <p className="text-[#0a4d3c] font-bold mb-4">Bogura, Bangladesh • 15 years Experience</p>
                       <p className="text-gray-600 text-sm leading-relaxed mb-4">&quot;I believe that the health of the land is the health of the people. Our farm has been organic for three generations, focusing on heirloom seeds and natural fertilizers.&quot;</p>
                       <Link href={`/farmers/1`} className="flex items-center gap-2 text-sm font-black text-[#0a4d3c] group">
                          View Farm Profile <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                       </Link>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">You Might Also Like</h2>
            <p className="text-gray-500 font-medium">Handpicked additions for your healthy basket.</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/shop")} className="rounded-full hidden sm:flex">See All</Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.length > 0 ? (
            relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                category={p.category?.name || "Fresh"}
                vendor={p.vendor || "Local Farm"}
                location={p.location || "Nearby"}
                image={p.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e"}
                price={p.price}
                unit={p.unit || "kg"}
                tag={p.discount ? `${p.discount}% OFF` : undefined}
              />
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <div className="space-y-2">
                   <Skeleton className="h-4 w-2/3" />
                   <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
