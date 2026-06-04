"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

const routeTitles: Record<string, string> = {
  "/dashboard": "Executive Dashboard",
  "/dashboard/accounting": "Accounting",
  "/dashboard/accounting/reports": "Financial Reports",
  "/dashboard/ai-assistant": "AI Assistant",
  "/dashboard/profile": "Profile",
  "/dashboard/reconciliation": "Business Health",
}

function getTitle(pathname: string) {
  if (routeTitles[pathname]) return routeTitles[pathname]

  const segment = pathname.split("/").filter(Boolean).at(-1)
  if (!segment) return "Dashboard"

  return segment
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getTitle(pathname)}</h1>
      </div>
    </header>
  )
}
