"use client";

import { useCart } from "@/context/cart-context";
import { useWishlist, WishlistItem } from "@/context/wishlist-context";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Minus, Store, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  vendor: string;
  location: string;
  image: string;
  tag?: string;
  price: number;
  unit: string;
  stock?: string;
  rating?: number;
  orders?: number;
  className?: string;
}

export function ProductCard({
  id,
  name,
  category,
  vendor,
  image,
  tag,
  price,
  unit,
  rating = 4.8,
  className,
}: ProductCardProps) {
  const { cart, addToCart, updateQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const cartItem = cart.find((item) => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isWishlisted = isInWishlist(id);

  const productData: WishlistItem = {
    id,
    name,
    price,
    image,
    category,
    vendor
  };

  const handleUpdateQuantity = (newQty: number) => {
    if (quantity === 0 && newQty > 0) {
      addToCart({ id, name, price, image, quantity: 1 });
    } else {
      updateQuantity(id, newQty);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex flex-col bg-white rounded-[2.5rem] border border-gray-100 p-4 shadow-sm hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500",
        className
      )}
    >
      {/* Badges */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        {tag && (
          <div className="bg-[#facc15] text-[#0a4d3c] text-[10px] font-black px-3 py-1 rounded-full shadow-lg tracking-wider uppercase">
            {tag}
          </div>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={() => toggleWishlist(productData)}
        className={cn(
          "absolute top-6 right-6 z-20 size-10 rounded-full bg-white/90 backdrop-blur-md border border-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 shadow-xl shadow-black/5",
          isWishlisted ? "text-rose-500" : "text-gray-400 hover:text-rose-500"
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        type="button"
      >
        <Heart className={cn("size-5 transition-all", isWishlisted && "fill-current")} />
      </button>

      {/* Image Section */}
      <Link href={`/shop/${id}`} className="relative aspect-square w-full mb-5 overflow-hidden rounded-[2rem] bg-[#f8fafc]">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 256px"
          />
        </motion.div>
        
        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/40 flex items-center gap-1 shadow-sm">
          <Star className="size-3 fill-[#facc15] text-[#facc15]" />
          <span className="text-[10px] font-black text-gray-900">{rating}</span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
            {category}
          </span>
          <div className="h-1 w-1 rounded-full bg-emerald-200" />
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            <Store className="size-3" />
            <span className="truncate max-w-[80px]">{vendor}</span>
          </div>
        </div>

        <Link href={`/shop/${id}`}>
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 line-clamp-1 group-hover:text-[#0a4d3c] transition-colors tracking-tight">
            {name}
          </h3>
        </Link>

        {/* Pricing */}
        <div className="flex items-end gap-1 mb-6">
          <span className="text-xl font-black text-[#0a4d3c]">AED {price.toFixed(2)}</span>
          <span className="text-xs text-gray-400 font-bold mb-1">/ {unit}</span>
        </div>

        {/* Action Button */}
        <div className="mt-auto relative">
          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleUpdateQuantity(1)}
                className="w-full h-14 bg-[#0a4d3c] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:bg-emerald-900 shadow-lg shadow-emerald-950/20 active:scale-95"
              >
                <div className="size-6 bg-white/10 rounded-full flex items-center justify-center">
                  <Plus className="size-4" />
                </div>
                ADD TO BASKET
              </motion.button>
            ) : (
              <motion.div
                key="quantity"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full h-14 flex items-center justify-between border-2 border-[#0a4d3c] rounded-2xl overflow-hidden bg-white shadow-xl shadow-emerald-950/5 p-1"
              >
                <button
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                  className="w-12 h-full flex items-center justify-center text-[#0a4d3c] hover:bg-emerald-50 rounded-xl transition-colors focus:outline-none"
                >
                  <Minus className="size-5" />
                </button>
                
                <span className="flex-1 text-center font-black text-gray-900 text-lg">
                  {quantity}
                </span>
                
                <button
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                  className="w-12 h-full flex items-center justify-center text-[#0a4d3c] hover:bg-emerald-50 rounded-xl transition-colors focus:outline-none"
                >
                  <Plus className="size-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
