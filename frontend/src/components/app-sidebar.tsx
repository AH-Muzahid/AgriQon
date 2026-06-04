"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  BadgeCheckIcon,
  BarChart3Icon,
  BotIcon,
  BoxesIcon,
  Building2Icon,
  ClipboardListIcon,
  CreditCardIcon,
  FactoryIcon,
  GaugeIcon,
  HandshakeIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  PackageIcon,
  ReceiptTextIcon,
  ScaleIcon,
  Settings2Icon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StoreIcon,
  TruckIcon,
  UsersIcon,
  WarehouseIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Agriqon Admin",
    email: "ops@agriqon.local",
    avatar: "",
  },
  teams: [
    {
      name: "Agriqon Market",
      logo: <StoreIcon />,
      plan: "Marketplace HQ",
    },
    {
      name: "Farm Supply Unit",
      logo: <FactoryIcon />,
      plan: "Procurement",
    },
    {
      name: "Retail Outlet",
      logo: <ShoppingBagIcon />,
      plan: "Sales",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      items: [
        { title: "Executive Dashboard", url: "/dashboard" },
        { title: "Analytics", url: "/dashboard/analytics" },
        { title: "Reports", url: "/dashboard/reports" },
      ],
    },
    {
      title: "Marketplace",
      url: "/dashboard/products",
      icon: <PackageIcon />,
      items: [
        { title: "Products", url: "/dashboard/products" },
        { title: "Categories & Brands", url: "/dashboard/catalog" },
        { title: "Customers", url: "/dashboard/customers" },
        { title: "Reviews", url: "/dashboard/reviews" },
      ],
    },
    {
      title: "Orders & Fulfillment",
      url: "/dashboard/orders",
      icon: <ClipboardListIcon />,
      items: [
        { title: "Orders", url: "/dashboard/orders" },
        { title: "Invoices", url: "/dashboard/invoices" },
        { title: "Payments", url: "/dashboard/payments" },
        { title: "Loyalty", url: "/dashboard/loyalty" },
      ],
    },
    {
      title: "Inventory & Supply",
      url: "/dashboard/inventory",
      icon: <BoxesIcon />,
      items: [
        { title: "Inventory", url: "/dashboard/inventory" },
        { title: "Warehouses", url: "/dashboard/warehouses" },
        { title: "Stock Movements", url: "/dashboard/stock-movements" },
        { title: "Purchases", url: "/dashboard/purchases" },
        { title: "Suppliers", url: "/dashboard/suppliers" },
      ],
    },
    {
      title: "Finance",
      url: "/dashboard/accounting",
      icon: <ScaleIcon />,
      items: [
        { title: "Accounting", url: "/dashboard/accounting" },
        { title: "Financial Reports", url: "/dashboard/accounting/reports" },
        { title: "Reconciliation", url: "/dashboard/reconciliation" },
        { title: "Billing", url: "/dashboard/billing" },
        { title: "Subscriptions", url: "/dashboard/subscriptions" },
      ],
    },
    {
      title: "AI & Control",
      url: "/dashboard/ai-assistant",
      icon: <BotIcon />,
      items: [
        { title: "AI Assistant", url: "/dashboard/ai-assistant" },
        { title: "Forecasting", url: "/dashboard/forecasting" },
        { title: "Audit Trail", url: "/dashboard/audit" },
        { title: "Notifications", url: "/dashboard/notifications" },
        { title: "Settings", url: "/dashboard/settings" },
      ],
    },
    {
      title: "Organization",
      url: "/dashboard/business",
      icon: <Building2Icon />,
      items: [
        { title: "Businesses", url: "/dashboard/business" },
        { title: "Users & Roles", url: "/dashboard/users" },
        { title: "Permissions", url: "/dashboard/permissions" },
      ],
    },
  ],
  quickLinks: [
    { title: "New Order", url: "/dashboard/orders/new", icon: <ReceiptTextIcon /> },
    { title: "Low Stock", url: "/dashboard/inventory?filter=low-stock", icon: <WarehouseIcon /> },
    { title: "Suppliers", url: "/dashboard/suppliers", icon: <TruckIcon /> },
    { title: "Business Health", url: "/dashboard/reconciliation", icon: <ShieldCheckIcon /> },
  ],
  supportLinks: [
    { title: "Profile", url: "/dashboard/profile", icon: <BadgeCheckIcon /> },
    { title: "Business Settings", url: "/dashboard/settings", icon: <Settings2Icon /> },
    { title: "Subscription", url: "/dashboard/subscriptions", icon: <CreditCardIcon /> },
  ],
}

const sidebarGroups = [
  { label: "Command Center", items: data.navMain.slice(0, 3) },
  { label: "ERP Core", items: data.navMain.slice(3, 5) },
  { label: "Governance", items: data.navMain.slice(5) },
]

const statusItems = [
  { title: "Operations", url: "/dashboard/analytics", icon: <GaugeIcon /> },
  { title: "Financial KPIs", url: "/dashboard/accounting/reports", icon: <BarChart3Icon /> },
  { title: "Customers", url: "/dashboard/customers", icon: <UsersIcon /> },
  { title: "Audit ready", url: "/dashboard/audit", icon: <HistoryIcon /> },
  { title: "AI enabled", url: "/dashboard/ai-assistant", icon: <SparklesIcon /> },
  { title: "Tenant scoped", url: "/dashboard/business", icon: <HandshakeIcon /> },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
        <NavSecondary items={data.quickLinks} />
        <NavSecondary items={statusItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={data.supportLinks} className="group-data-[collapsible=icon]:hidden" />
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
