"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "react-hot-toast"

export interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  category?: string
  vendor?: string
}

interface WishlistContextType {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  toggleWishlist: (item: WishlistItem) => void
  isInWishlist: (id: string) => boolean
  wishlistCount: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    const savedWishlist = localStorage.getItem("agriqon_wishlist")
    if (savedWishlist) {
      try {
        const parsed = JSON.parse(savedWishlist)
        const coerced = parsed.map((item: any) => ({ ...item, price: Number(item.price) }))
        queueMicrotask(() => setWishlist(coerced))
      } catch (e) {
        console.error("Failed to parse wishlist from localStorage", e)
      }
    }
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("agriqon_wishlist", JSON.stringify(wishlist))
    }
  }, [wishlist, isMounted])

  const addToWishlist = (item: WishlistItem) => {
    const coercedItem = { ...item, price: Number(item.price) };
    setWishlist((prev) => {
      if (prev.find((i) => i.id === coercedItem.id)) {
        return prev
      }
      toast.success("Added to wishlist!")
      return [...prev, coercedItem]
    })
  }

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id))
    toast.success("Removed from wishlist")
  }

  const toggleWishlist = (item: WishlistItem) => {
    if (wishlist.some(i => i.id === item.id)) {
      removeFromWishlist(item.id)
    } else {
      addToWishlist(item)
    }
  }

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
