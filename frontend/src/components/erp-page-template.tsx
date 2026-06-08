'use client';

import React from 'react';
import { Permission } from '@/types/permission';
import { PermissionGate } from './permission-gate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from './lucide-icon';
import { LayoutGrid, Plus } from 'lucide-react';

interface ErpPageTemplateProps {
  title: string;
  description: string;
  permission?: Permission;
  primaryAction?: {
    label: string;
    icon?: string;
    onClick?: () => void;
  };
  emptyState?: {
    title?: string;
    description?: string;
    icon?: string;
    actionLabel?: string;
  };
  children?: React.ReactNode;
}

export function ErpPageTemplate({
  title,
  description,
  permission,
  primaryAction,
  emptyState,
  children,
}: ErpPageTemplateProps) {
  const pageContent = (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        
        {/* Top-Right Action Button */}
        {primaryAction && (
          <Button onClick={primaryAction.onClick} className="gap-2 cursor-pointer font-semibold shadow-sm">
            <LucideIcon name={primaryAction.icon || 'Plus'} className="h-4 w-4" />
            {primaryAction.label}
          </Button>
        )}
      </div>

      {/* Main Content Pane */}
      <Card className="border shadow-sm min-h-[450px] flex flex-col justify-between">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base font-semibold">Workspace</CardTitle>
          <CardDescription>ERP Sandbox Environment & Workflow Controller</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Custom children or standardized Empty State */}
          {children ? (
            <div className="w-full h-full">{children}</div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground border">
                <LucideIcon name={emptyState?.icon || 'LayoutGrid'} className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {emptyState?.title || `No ${title} Found`}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {emptyState?.description ||
                  `Get started by creating your first entry. Click the button below to initiate the wizard.`}
              </p>
              <div className="mt-6">
                <Button size="sm" variant="outline" className="gap-1.5 font-medium cursor-pointer" onClick={primaryAction?.onClick}>
                  <Plus className="h-3.5 w-3.5" />
                  {emptyState?.actionLabel || `Add ${title}`}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Wrap in PermissionGate if permission is specified
  if (permission) {
    return <PermissionGate permission={permission}>{pageContent}</PermissionGate>;
  }

  return pageContent;
}
export default ErpPageTemplate;
