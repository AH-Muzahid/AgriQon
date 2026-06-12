'use client';

import { ErpProvider } from '@/components/providers/erp-provider';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ErpSidebar } from '@/components/erp-sidebar';
import { ErpNavbar } from '@/components/erp-navbar';
import { CommandPalette } from '@/components/command-palette';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Authentication guard for all ERP routes.
 *
 * Behavior:
 * - While auth is loading → full-page spinner, no ERP chrome visible.
 * - If not authenticated → redirect to /auth/login.
 * - If authenticated → render the full ERP shell.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/auth/login');
      } else if (!user?.businessId) {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Loading state — show spinner, hide all ERP content
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying session…</p>
        </div>
      </div>
    );
  }

  // Not authenticated or no business — render nothing while redirect fires
  if (!isAuthenticated || !user?.businessId) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting…</p>
        </div>
      </div>
    );
  }

  // Authenticated and has business — render children
  return <>{children}</>;
}

import { useSubscriptionStatus } from '@/hooks/use-subscription';
import { Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

function SubscriptionBanners() {
  const { isTrialWarning, isGracePeriod, isSuspended, daysRemaining, graceEndsAt } = useSubscriptionStatus();

  if (isSuspended) {
    return (
      <div className="bg-red-500/10 text-red-600 dark:text-red-400 border-b border-red-500/20 px-4 py-2.5 flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <div>
          <span className="font-semibold">Subscription Suspended:</span> Your account is suspended. All record mutations are blocked. Please <Link href="/subscription" className="underline font-medium hover:opacity-80">Upgrade / Renew</Link> to restore access.
        </div>
      </div>
    );
  }

  if (isGracePeriod) {
    return (
      <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-2 text-sm">
        <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
        <div>
          <span className="font-semibold">Read-Only Grace Period:</span> Your subscription has expired. Grace period active until{' '}
          <strong>{graceEndsAt ? new Date(graceEndsAt).toLocaleDateString() : 'N/A'}</strong>. New edits are blocked. Please{' '}
          <Link href="/subscription" className="underline font-medium hover:opacity-80">Upgrade / Renew</Link>.
        </div>
      </div>
    );
  }

  if (isTrialWarning) {
    return (
      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-b border-blue-500/20 px-4 py-2.5 flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 shrink-0" />
        <div>
          <span className="font-semibold">Free Trial Alert:</span> Your free trial expires in <strong>{daysRemaining} days</strong>. <Link href="/subscription" className="underline font-medium hover:opacity-80">Upgrade now</Link> to prevent operational disruption.
        </div>
      </div>
    );
  }

  return null;
}

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <ErpProvider>
        <SidebarProvider
          style={
            {
              '--sidebar-width': '16.5rem',
              '--sidebar-width-icon': '3rem',
            } as React.CSSProperties
          }
        >
          <div className="flex h-screen w-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <ErpSidebar />
            
            {/* Main Content Area */}
            <SidebarInset className="flex flex-1 flex-col overflow-hidden">
              {/* Top Navigation Navbar */}
              <ErpNavbar />

              {/* Global Subscription Warnings */}
              <SubscriptionBanners />
              
              {/* Page Content viewport */}
              <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
                {children}
              </main>
            </SidebarInset>
          </div>

          {/* Global Keyboard Command Palette */}
          <CommandPalette />
        </SidebarProvider>
      </ErpProvider>
    </AuthGuard>
  );
}
