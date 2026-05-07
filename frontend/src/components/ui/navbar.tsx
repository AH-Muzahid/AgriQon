"use client"

import Link from "next/link"
import React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar() {
  return (
    <header className={cn("w-full border-b bg-background/50 backdrop-blur-sm") }>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-semibold">
              Agriqon
            </Link>
            <nav className="hidden md:flex gap-2 text-sm text-muted-foreground">
              <Link href="/" className="px-2 py-1 rounded hover:bg-muted">Home</Link>
              <Link href="/dashboard" className="px-2 py-1 rounded hover:bg-muted">Dashboard</Link>
              <Link href="/marketplace" className="px-2 py-1 rounded hover:bg-muted">Marketplace</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
