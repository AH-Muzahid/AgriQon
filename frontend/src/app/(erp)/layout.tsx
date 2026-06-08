'use client';

import { ErpProvider } from '@/components/providers/erp-provider';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ErpSidebar } from '@/components/erp-sidebar';
import { ErpNavbar } from '@/components/erp-navbar';
import { CommandPalette } from '@/components/command-palette';
import React from 'react';

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
