'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardWidgetProps {
  title: string;
  description?: string;
  loading: boolean;
  className?: string;
  children: React.ReactNode;
}

export function DashboardWidget({ title, description, loading, className = '', children }: DashboardWidgetProps) {
  return (
    <Card className={`border-slate-800 bg-slate-900/40 ${className}`}>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-slate-200">{title}</CardTitle>
        {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-80 relative">
        {loading ? (
          <Skeleton className="h-full w-full absolute inset-0 rounded-b-lg p-6 bg-slate-900/10" />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
