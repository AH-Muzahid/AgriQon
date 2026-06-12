'use client';

import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';

interface OrderColumnsProps {
  onViewDetails: (order: any) => void;
}

export function getOrderColumns({ onViewDetails }: OrderColumnsProps) {
  return [
    {
      header: 'Order Number',
      accessor: (row: any) => (
        <span className="font-semibold text-foreground font-mono text-xs block">
          SO-{row.id.substring(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: (row: any) => (
        <span className="font-medium text-foreground">{row.customer?.name || 'Walk-in Client'}</span>
      ),
    },
    {
      header: 'Total Sale',
      accessor: (row: any) => (
        <span className="font-semibold text-foreground">
          ${Number(row.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Date Logged',
      accessor: (row: any) => (
        <span className="text-muted-foreground text-sm">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetails(row)} title="View Details">
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
