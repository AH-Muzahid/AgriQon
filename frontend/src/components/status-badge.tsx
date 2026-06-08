'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ErpStatus =
  // Active states
  | 'ACTIVE'
  | 'INACTIVE'
  // Order states
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'DELIVERED'
  | 'CANCELLED'
  // Invoice / Payment states
  | 'PAID'
  | 'PARTIAL'
  | 'UNPAID'
  | 'FAILED'
  | 'DRAFT'
  | 'OVERDUE'
  | 'SUCCESS'
  | 'REFUNDED'
  // Stock states
  | 'LOW_STOCK'
  | 'IN_STOCK'
  | 'OUT_OF_STOCK';

interface StatusBadgeProps {
  status: ErpStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toUpperCase();

  // Unified visual style guidelines
  const getBadgeStyle = (statusStr: string) => {
    switch (statusStr) {
      case 'ACTIVE':
      case 'DELIVERED':
      case 'PAID':
      case 'SUCCESS':
      case 'IN_STOCK':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15';
      
      case 'PENDING':
      case 'DRAFT':
      case 'PARTIAL':
      case 'CONFIRMED':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15';
      
      case 'PROCESSING':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15';
      
      case 'INACTIVE':
      case 'CANCELLED':
      case 'FAILED':
      case 'OVERDUE':
      case 'REFUNDED':
      case 'OUT_OF_STOCK':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/15';
      
      case 'LOW_STOCK':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/15 font-bold animate-pulse';
      
      default:
        return 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
    }
  };

  const formatText = (statusStr: string) => {
    return statusStr.replace('_', ' ');
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md border shadow-none transition-colors duration-150',
        getBadgeStyle(normalizedStatus),
        className
      )}
    >
      {formatText(normalizedStatus)}
    </Badge>
  );
}
export default StatusBadge;
