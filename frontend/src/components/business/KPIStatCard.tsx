'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KPIStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function KPIStatCard({
  title,
  value,
  description,
  icon,
  isLoading = false,
  className,
}: KPIStatCardProps) {
  return (
    <Card className={cn('bg-card/50 backdrop-blur-sm shadow-sm border-muted/60 hover:border-primary/20 transition-all duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-[120px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
export default KPIStatCard;
