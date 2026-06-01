"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Minus, Plus, ShieldCheck, Star, Store } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useWishlist, WishlistItem } from "@/context/wishlist-context";
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
    vendor,
  };

  const priceNumber = Number(price);
  const formattedPrice = Number.isFinite(priceNumber) ? priceNumber.toFixed(2) : null;

  const handleUpdateQuantity = (newQty: number) => {
    if (quantity === 0 && newQty > 0) {
      addToCart({ id, name, price, image, quantity: 1 });
    } else {
      updateQuantity(id, newQty);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative flex min-h-full flex-col overflow-hidden rounded-lg border border-[#dce8de] bg-white shadow-sm transition-all duration-300 hover:border-[#9cc6a9] hover:shadow-xl hover:shadow-emerald-950/8",
        className
      )}
    >
      <Link href={`/shop/${id}`} className="relative aspect-[4/3] w-full overflow-hidden bg-[#eef5ef]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 280px"
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[11px] font-black text-[#123a30] shadow-sm backdrop-blur">
          <Star className="size-3 fill-[#f5c542] text-[#f5c542]" />
          {rating}
        </div>
        {tag && (
          <div className="absolute left-3 top-3 rounded-md bg-[#9f3146] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            {tag}
          </div>
        )}
      </Link>

      <button
        onClick={() => toggleWishlist(productData)}
        className={cn(
          "absolute right-3 top-3 z-20 flex size-10 items-center justify-center rounded-lg border border-white/70 bg-white/90 text-gray-500 shadow-lg shadow-black/5 backdrop-blur transition-all hover:scale-105 hover:text-rose-500 active:scale-95",
          isWishlisted && "text-rose-500"
        )}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        type="button"
      >
        <Heart className={cn("size-5", isWishlisted && "fill-current")} />
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-md bg-[#edf7ef] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#26704d]">
            {category}
          </span>
          <span className="flex min-w-0 items-center gap-1 text-[11px] font-bold text-[#75877d]">
            <Store className="size-3 shrink-0" />
            <span className="truncate">{vendor}</span>
          </span>
        </div>

        <Link href={`/shop/${id}`}>
          <h3 className="mb-3 line-clamp-2 min-h-[3rem] text-lg font-black leading-tight text-[#123a30] transition-colors group-hover:text-[#2f7b57]">
            {name}
          </h3>
        </Link>

        <div className="mb-4 flex items-center gap-2 text-xs font-bold text-[#66786f]">
          <ShieldCheck className="size-4 text-[#2f7b57]" />
          Verified origin
        </div>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#8d9b94]">
              Market price
            </p>
            <p className="text-2xl font-black text-[#123a30]">
              AED {formattedPrice ?? "-"}
              <span className="ml-1 text-xs font-bold text-[#75877d]">/ {unit}</span>
            </p>
          </div>

          <AnimatePresence mode="wait">
            {quantity === 0 ? (
              <motion.button
                key="add"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                onClick={() => handleUpdateQuantity(1)}
                className="flex size-12 items-center justify-center rounded-lg bg-[#123a30] text-white shadow-lg shadow-emerald-950/18 transition-all hover:bg-[#215b49] active:scale-95"
                aria-label={`Add ${name} to basket`}
              >
                <Plus className="size-5" />
              </motion.button>
            ) : (
              <motion.div
                key="quantity"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="flex h-12 items-center rounded-lg border border-[#123a30] bg-white p-1"
              >
                <button
                  onClick={() => handleUpdateQuantity(quantity - 1)}
                  className="flex size-9 items-center justify-center rounded-md text-[#123a30] transition-colors hover:bg-[#edf7ef]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-7 text-center text-sm font-black text-[#123a30]">
                  {quantity}
                </span>
                <button
                  onClick={() => handleUpdateQuantity(quantity + 1)}
                  className="flex size-9 items-center justify-center rounded-md text-[#123a30] transition-colors hover:bg-[#edf7ef]"
                  aria-label="Increase quantity"
                >
                  <Plus className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
