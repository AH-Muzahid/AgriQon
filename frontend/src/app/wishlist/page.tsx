"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Store } from "lucide-react";
import { useWishlist, WishlistItem } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, wishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product: WishlistItem) => {
    addToCart({ ...product, quantity: 1 });
    removeFromWishlist(product.id);
    toast.success(`${product.name} moved to cart!`);
  };

  return (
    <main className="min-h-screen bg-gray-50/50 pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors mb-2">
              <ArrowLeft className="size-4" />
              Back to Shop
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Your Wishlist
              <span className="text-lg font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                {wishlistCount}
              </span>
            </h1>
            <p className="text-gray-500 max-w-lg">
              Saved items you&apos;re interested in. Move them to cart when you&apos;re ready to harvest!
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {wishlistCount > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {wishlist.map((item) => (
                <motion.div 
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                        <Store className="size-3" />
                        {item.vendor || "Direct from Farm"}
                      </div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-1 mt-1">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">AED {((Number(item.price) || 0) * 1.2).toFixed(2)}</span>
                        <span className="text-xl font-black text-gray-900">AED {Number(item.price || 0).toFixed(2)}</span>
                      </div>
                      <Button
                        onClick={() => handleMoveToCart(item)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
                      >
                        <ShoppingCart className="size-4 mr-2" />
                        Move to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-100 rounded-full scale-150 blur-3xl opacity-50" />
                <div className="relative size-32 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-emerald-50">
                  <Heart className="size-16 text-emerald-200" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Your wishlist is empty</h2>
              <p className="text-gray-500 max-w-sm mb-10 text-lg leading-relaxed">
                Save items you love and they will appear here. Start exploring our fresh harvest!
              </p>
              <Link href="/shop">
                <Button size="lg" className="rounded-2xl h-14 px-8 text-lg font-bold bg-[#0a4d3c] hover:bg-[#07382b] shadow-xl shadow-emerald-100">
                  Browse Marketplace
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
