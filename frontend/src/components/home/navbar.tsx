"use client"

import Link from "next/link"
import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Menu, X, Search, ShoppingCart, Truck, Headphones, ChevronDown, Heart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, logout, isAuthenticated } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Keyboard navigation for dropdown
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!profileOpen) return
      if (!menuRef.current) return

      const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a, button'))
      if (e.key === 'Escape') {
        setProfileOpen(false)
        triggerRef.current?.focus()
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = items.findIndex((el) => el === document.activeElement)
        const next = items[idx + 1] || items[0]
        next?.focus()
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        const idx = items.findIndex((el) => el === document.activeElement)
        const prev = items[idx - 1] || items[items.length - 1]
        prev?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [profileOpen])

  return (
    <header className="w-full bg-white font-sans relative">
      {/* Announcement Bar */}
      <div className="w-full bg-[#0a4d3c] text-white text-sm py-2 text-center font-medium">
        Welcome offer — <span className="text-[#facc15]">20% off</span> your first grocery order.
      </div>

      {/* Main Navbar (Middle Layer) */}
      <div className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-6">
            
            {/* Mobile menu button */}
            <button
              aria-label="menu"
              className="inline-flex items-center rounded-md p-2 lg:hidden text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="flex items-center justify-center p-1.5 rounded-lg border-2 border-[#0a4d3c] text-[#0a4d3c]">
                <ShoppingCart className="size-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-bold text-[#0a4d3c] tracking-tight">AgriQon</span>
            </Link>

            <div className="flex-1 hidden lg:flex items-center max-w-3xl px-6">
              <form onSubmit={handleSearch} className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 group-focus-within:text-[#0a4d3c] transition-colors" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for farm fresh groceries..." 
                  className="w-full pl-12 bg-gray-50 border-transparent rounded-full h-[46px] text-[15px] focus-visible:ring-[#0a4d3c] focus:bg-white focus:border-gray-100 transition-all shadow-sm focus:shadow-md" 
                />
                <button type="submit" className="sr-only">Search</button>
              </form>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-5 sm:gap-8 shrink-0">
              <div className="hidden xl:flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-full">
                  <Truck className="size-5 text-[#0a4d3c]" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] text-gray-500 font-medium">Delivery to</span>
                  <span className="text-sm font-bold text-[#0a4d3c]">Abu Dhabi</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/wishlist" className="relative group hidden sm:block">
                  <div className="flex items-center justify-center h-11 w-11 bg-gray-50 rounded-full text-gray-600 transition-all group-hover:bg-red-50 group-hover:text-red-500">
                    <Heart className="size-5" />
                  </div>
                  <AnimatePresence>
                    {wishlistCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        key={wishlistCount}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white border-2 border-white shadow-sm"
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                <Link href="/cart" className="relative group">
                  <div className="flex items-center justify-center h-11 w-11 bg-[#0a4d3c] rounded-full text-white transition-colors group-hover:bg-[#07382b]">
                    <ShoppingCart className="size-5" />
                  </div>
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        key={cartCount} 
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#facc15] text-[11px] font-bold text-[#0a4d3c] border-2 border-white shadow-sm"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                <div className="relative" ref={menuRef}>
                  {isAuthenticated && user ? (
                    <>
                      <button
                        ref={triggerRef}
                        onClick={() => setProfileOpen((s) => !s)}
                        className="flex items-center justify-center h-11 w-11 rounded-full overflow-hidden border-2 border-transparent hover:border-gray-200 focus:outline-none focus:border-gray-300 transition-all"
                        aria-expanded={profileOpen}
                      >
                        {user?.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={`${user.name} avatar`}
                            width={44}
                            height={44}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#facc15] text-[#0a4d3c] flex items-center justify-center font-bold text-lg">
                            {(user.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </button>

                      {profileOpen && (
                        <div className="absolute right-0 mt-3 w-48 rounded-xl border border-gray-100 bg-white shadow-lg z-50 py-2">
                          <div className="px-4 py-2 border-b border-gray-50 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email || 'user@example.com'}</p>
                          </div>
                          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Profile</Link>
                          <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Orders</Link>
                          <button
                            onClick={async () => {
                              await logout()
                              setProfileOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Logout
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/auth/login">
                         <div className="h-11 w-11 bg-[#facc15] text-[#0a4d3c] rounded-full flex items-center justify-center overflow-hidden">
                           {/* Using a placeholder avatar for non-authenticated visual match if required, otherwise show an icon */}
                           <Image src="https://i.pravatar.cc/150?img=47" alt="User Avatar" width={44} height={44} className="h-full w-full object-cover" />
                         </div>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Layer (Links) */}
      <div className="hidden lg:block border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[40px] items-center justify-between text-[15px] font-medium text-gray-500">
            <div className="flex items-center gap-8">
              <Link href="/shop" className="text-[#0a4d3c] font-bold">Shop</Link>
              <button className="flex items-center gap-1.5 hover:text-[#0a4d3c] transition-colors">
                Categories <ChevronDown className="size-4 opacity-50" />
              </button>
              <Link href="/deals" className="hover:text-[#0a4d3c] transition-colors">Deals</Link>
              <Link href="/fresh-produce" className="hover:text-[#0a4d3c] transition-colors">Fresh Produce</Link>
              <Link href="/about" className="hover:text-[#0a4d3c] transition-colors">About</Link>
            </div>
            <div className="flex items-center gap-8">
              <Link href="/policy" className="hover:text-[#0a4d3c] transition-colors">Policy</Link>
              <Link href="/faq" className="hover:text-[#0a4d3c] transition-colors">FAQ&apos;s</Link>
              <Link href="/help" className="flex items-center gap-2 hover:text-[#0a4d3c] transition-colors">
                <div className="bg-gray-100 p-1 rounded-full text-gray-600">
                  <Headphones className="size-4" />
                </div>
                Help & Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar (visible only on small screens) */}
      <div className="lg:hidden px-4 py-3 border-b border-gray-100 bg-white">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groceries..." 
            className="w-full pl-12 bg-gray-50 border-transparent rounded-full h-11 text-sm focus-visible:ring-[#0a4d3c]" 
          />
        </form>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full border-b bg-white shadow-xl z-50 max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="px-4 py-4 space-y-4">
            <div className="flex xl:hidden items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <Truck className="size-5 text-[#0a4d3c]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs text-gray-500">Delivery to</span>
                <span className="text-sm font-bold text-[#0a4d3c]">Abu Dhabi</span>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              <Link href="/shop" className="px-4 py-3 rounded-xl font-bold text-[#0a4d3c] bg-emerald-50">Shop</Link>
              <button className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50">
                Categories <ChevronDown className="size-5 opacity-50" />
              </button>
              <Link href="/deals" className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Deals</Link>
              <Link href="/fresh-produce" className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Fresh Produce</Link>
              <Link href="/about" className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50">About</Link>
              <div className="h-px bg-gray-100 my-2"></div>
              <Link href="/policy" className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50">Policy</Link>
              <Link href="/faq" className="px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50">FAQ&apos;s</Link>
              <Link href="/help" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-gray-50">
                <div className="p-1.5 bg-gray-100 rounded-full">
                  <Headphones className="size-5" />
                </div> 
                Help & Support
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
