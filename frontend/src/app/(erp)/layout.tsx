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
