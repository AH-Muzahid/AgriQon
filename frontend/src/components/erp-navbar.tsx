'use client';

import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { DashboardBreadcrumbs } from './dashboard-breadcrumbs';
import { useAuthStore } from '@/store/auth-store';
import { useOrganizationStore } from '@/store/organization-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { Bell, Sun, Moon, Laptop, ShieldAlert, Sparkles, Database, Search, CreditCard } from 'lucide-react';

export function ErpNavbar() {
  const { user } = useAuthStore();
  const { currentBusiness, activeWarehouseId, warehouses, setActiveWarehouseId } = useOrganizationStore();
  const { setTheme } = useTheme();

  const activeWarehouse = warehouses.find((w) => w.id === activeWarehouseId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Trigger Ctrl+K Command Palette programmatically on search bar click
  const triggerCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  };

  const [notifications, setNotifications] = React.useState([
    {
      id: '1',
      title: 'AgroAI Demand Forecast Ready',
      desc: 'Market demand for potato has spiked by 18% in Bogura region.',
      time: '2 mins ago',
      type: 'info',
      read: false,
    },
    {
      id: '2',
      title: 'Low Stock Alert',
      desc: 'NPK Fertilizer (50kg) is below safe threshold in Dhaka Warehouse.',
      time: '1 hour ago',
      type: 'warning',
      read: false,
    },
    {
      id: '3',
      title: 'Invoice Payment Received',
      desc: 'Invoice #INV-2026-004 has been paid in full via bKash.',
      time: '3 hours ago',
      type: 'success',
      read: false,
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 shadow-sm md:px-6">
      <div className="flex items-center gap-4 shrink-0">
        <SidebarTrigger />
        <div className="hidden h-4 w-[1px] bg-border md:block" />
        <DashboardBreadcrumbs />
      </div>

      {/* Global search component */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <button
          onClick={triggerCommandPalette}
          className="w-full flex items-center justify-between gap-2 border rounded-xl px-3 py-1.5 text-xs text-muted-foreground bg-muted/30 hover:bg-muted/60 transition-colors text-left cursor-pointer border-slate-200"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search products, customers, orders, invoices, payments...</span>
          </div>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-[9px]">Ctrl</span>K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Active Warehouse Selector */}
        {warehouses.length > 0 && (
          <div className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 md:flex bg-muted/40">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Warehouse:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 gap-1 px-1 font-semibold text-xs cursor-pointer">
                  {activeWarehouse?.name || 'Select Warehouse'}
                  <span className="text-[10px] text-muted-foreground">({activeWarehouse?.code})</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {warehouses.map((wh) => (
                  <DropdownMenuItem
                    key={wh.id}
                    className="cursor-pointer text-xs"
                    onClick={() => setActiveWarehouseId(wh.id)}
                  >
                    <span className="font-semibold">{wh.name}</span>
                    <span className="ml-2 text-[10px] text-muted-foreground">({wh.code})</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Tenant Status indicator */}
        <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Tenant: {currentBusiness?.slug}
        </div>

        {/* Notifications Area */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full border cursor-pointer">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary cursor-pointer hover:underline bg-none border-none font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="py-1 max-h-[300px] overflow-y-auto">
              {notifications.map((n) => {
                let iconEl = <Sparkles className="h-4 w-4" />;
                let iconBg = 'bg-blue-500/10 text-blue-500';

                if (n.type === 'warning') {
                  iconEl = <ShieldAlert className="h-4 w-4" />;
                  iconBg = 'bg-amber-500/10 text-amber-500';
                } else if (n.type === 'success') {
                  iconEl = <CreditCard className="h-4 w-4" />;
                  iconBg = 'bg-emerald-500/10 text-emerald-600';
                }

                return (
                  <div
                    key={n.id}
                    onClick={() => toggleRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors relative border-b last:border-b-0 ${
                      !n.read ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''
                    }`}
                  >
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5 ${iconBg}`}>
                      {iconEl}
                    </div>
                    <div className="flex-1 grid gap-1 pr-4">
                      <p className={`text-xs font-semibold ${!n.read ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                        {n.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                      <p className="text-[9px] text-muted-foreground">{n.time}</p>
                    </div>
                    {!n.read && (
                      <span className="absolute right-3 top-4 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    )}
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                  No notifications.
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border cursor-pointer">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer gap-2">
              <Sun className="h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer gap-2">
              <Moon className="h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="cursor-pointer gap-2">
              <Laptop className="h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Mini Profile */}
        {user && (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 rounded-lg border">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  );
}
export default ErpNavbar;
