'use client';

import React from 'react';
import { Mail, Phone, Eye, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { CustomerContract } from '@/types/contracts/customer.contract';

interface CustomerColumnsProps {
  onViewDetails: (customer: CustomerContract) => void;
  onEdit: (customer: CustomerContract) => void;
  onDelete: (id: string, name: string) => void;
}

export function getCustomerColumns({
  onViewDetails,
  onEdit,
  onDelete,
}: CustomerColumnsProps) {
  return [
    {
      header: 'Customer Name',
      accessor: (row: CustomerContract) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.email || 'No email'}</span>
        </div>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (row: CustomerContract) => (
        <span className="text-muted-foreground text-xs">{row.phone || 'N/A'}</span>
      ),
    },
    {
      header: 'Orders Logged',
      accessor: (row: CustomerContract) => (
        <span className="font-semibold">{row.purchasesCount || 0} orders</span>
      ),
    },
    {
      header: 'Total Sales',
      accessor: (row: CustomerContract) => (
        <span className="font-mono font-medium">${(row.totalSpent || 0).toLocaleString()}</span>
      ),
    },
    {
      header: 'Outstanding Balance',
      accessor: (row: CustomerContract) => (
        <span className={row.dueAmount > 0 ? 'text-rose-600 font-mono font-bold' : 'text-emerald-600 font-mono font-bold'}>
          ${(row.dueAmount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: CustomerContract) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: CustomerContract) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetails(row)} title="View Dossier">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(row)} title="Modify Details">
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => onDelete(row.id, row.name)} title="Remove Profile">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
