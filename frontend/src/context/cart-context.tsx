"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  cartCount: number;
  wishlistCount: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  toggleWishlist: (id: string) => void;
  clearCart: () => void;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "agriqon_cart_v1";
const WISHLIST_KEY = "agriqon_wishlist_v1";

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Read localStorage once on mount.
  useEffect(() => {
    const parsedCart = safeParseJson<CartItem[]>(
      typeof window !== "undefined" ? localStorage.getItem(CART_KEY) : null
    );
    if (parsedCart) {
      queueMicrotask(() => setCart(parsedCart));
    }

    const parsedWishlist = safeParseJson<string[]>(
      typeof window !== "undefined" ? localStorage.getItem(WISHLIST_KEY) : null
    );
    if (parsedWishlist) {
      queueMicrotask(() => setWishlist(parsedWishlist));
    }

  }, []);

  // Persist cart.
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // ignore write errors (e.g., storage disabled)
    }
  }, [cart]);

  // Persist wishlist.
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch {
      // ignore write errors
    }
  }, [wishlist]);

  function addToCart(item: CartItem) {
    setCart((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p));
      }
      return [...prev, item];
    });
  }

  function updateQuantity(id: string, quantity: number) {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) => (item.id === id ? { ...item, quantity } : item));
    });
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleWishlist(id: string) {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  function clearCart() {
    setCart([]);
  }

  const value: CartContextType = useMemo(
    () => ({
      cart,
      wishlist,
      cartCount: cart.reduce((s, it) => s + it.quantity, 0),
      wishlistCount: wishlist.length,
      totalPrice: cart.reduce((s, it) => s + it.price * it.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      toggleWishlist,
      clearCart,
    }),
    [cart, wishlist]
  );



  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartProvider;

