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
  cartCount: number;
  totalPrice: number;
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "agriqon_cart_v1";

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

  // Read localStorage once on mount.
  useEffect(() => {
    const parsedCart = safeParseJson<CartItem[]>(
      typeof window !== "undefined" ? localStorage.getItem(CART_KEY) : null
    );
    if (parsedCart) {
      const coercedCart = parsedCart.map(item => ({ ...item, price: Number(item.price) }));
      queueMicrotask(() => setCart(coercedCart));
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

  function addToCart(item: CartItem) {
    const coercedItem = { ...item, price: Number(item.price) };
    setCart((prev) => {
      const found = prev.find((p) => p.id === coercedItem.id);
      if (found) {
        return prev.map((p) => (p.id === coercedItem.id ? { ...p, quantity: p.quantity + coercedItem.quantity } : p));
      }
      return [...prev, coercedItem];
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

  function clearCart() {
    setCart([]);
  }

  const value: CartContextType = useMemo(
    () => ({
      cart,
      cartCount: cart.reduce((s, it) => s + it.quantity, 0),
      totalPrice: cart.reduce((s, it) => s + Number(it.price) * it.quantity, 0),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [cart]
  );



  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default CartProvider;

