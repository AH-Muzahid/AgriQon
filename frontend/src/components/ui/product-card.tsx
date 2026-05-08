"use client";

import { useCart } from "@/context/cart-context";
import Image from "next/image";
import { Heart, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";


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
  image,
  tag,

  price,
  unit,
  className,
}: ProductCardProps) {
  const { cart, wishlist, addToCart, updateQuantity, toggleWishlist } = useCart();
  
  // Find current item in cart to get its quantity
  const cartItem = cart.find((item) => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;
  
  // Check if in wishlist
  const isWishlisted = wishlist.includes(id);

  // Derive an old price if tag exists (e.g., "20% OFF")
  const hasDiscount = !!tag;
  const oldPrice = hasDiscount ? (price * 1.25).toFixed(2) : null;

  const handleUpdateQuantity = (newQty: number) => {
    if (quantity === 0 && newQty > 0) {
      addToCart({ id, name, price, image, quantity: 1 });
    } else {
      updateQuantity(id, newQty);
    }
  };


  return (
    <article
      className={cn(
        "group relative flex flex-col bg-white rounded-md border border-slate-100 p-2 shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.98]",
        className
      )}
    >
      {/* Top Left Badge */}
      {tag && (
        <div className="absolute top-0 left-0 bg-[#7d002e] text-white text-[10px] font-bold px-2 py-1 rounded-tl-xl rounded-br-lg z-10">
          {tag}
        </div>
      )}

      {/* Image Section with Overlay */}
      <div className="relative aspect-square w-full flex items-center justify-center p-1 overflow-hidden rounded-md">
        <div className="relative w-full h-full transition-transform duration-700 group-hover:scale-110">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 256px"
          />
        </div>
        
        {/* Modern Overlay on Hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             <Plus className="w-5 h-5 text-[#004d2e]" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1">
        {/* Price Section */}
        <div className="flex items-center justify-center gap-1.5">
          {hasDiscount && (
            <span className="text-[11px] text-slate-400 line-through font-medium">
              BDT {oldPrice}
            </span>
          )}
          <span className="text-[14px] font-bold text-[#004d2e]">
            BDT {price.toFixed(2)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-[13px] text-center leading-tight mb-0.5 line-clamp-1">
          {name}
        </h3>

        {/* Subtitle / Unit */}
        <p className="text-[10px] text-slate-500 text-center mb-2 line-clamp-1">
          {unit} • {category}
        </p>

        {/* Action Button */}
        <div className="mt-auto flex items-center justify-center gap-3">
          <button 
            onClick={() => toggleWishlist(id)}
            className={cn(
              "transition-colors",
              isWishlisted ? "text-rose-500 fill-rose-500" : "text-slate-400 hover:text-rose-500"
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            type="button"
          >
            <Heart className="w-5 h-5" />
          </button>

          {quantity === 0 ? (
            <button
              onClick={() => handleUpdateQuantity(1)}
              className="w-full h-8 bg-[#f4f7f9] hover:bg-[#ebf0f3] text-slate-700 font-bold text-[11px] rounded-md flex items-center justify-center gap-1.5 transition-colors focus:outline-none"
            >
              <Plus className="w-3 h-3" />
              Add to cart
            </button>
          ) : (
            <div className="w-full h-8 flex items-center justify-between border border-[#004d2e] rounded-md overflow-hidden bg-white">
              <button
                onClick={() => handleUpdateQuantity(quantity - 1)}
                className="w-9 h-full flex items-center justify-center text-[#004d2e] hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              
              <div className="w-[1px] h-4 bg-[#004d2e]/20" />
              
              <span className="flex-1 text-center font-bold text-slate-900 text-[13px]">
                {quantity}
              </span>
              
              <div className="w-[1px] h-4 bg-[#004d2e]/20" />
              
              <button
                onClick={() => handleUpdateQuantity(quantity + 1)}
                className="w-9 h-full flex items-center justify-center text-[#004d2e] hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
