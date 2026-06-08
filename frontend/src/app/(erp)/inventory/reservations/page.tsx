'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function StockReservationsPage() {
  return (
    <ErpPageTemplate
      title="Stock Reservations"
      description="Block quantities for pending sales, high-priority accounts, or future campaigns."
      permission="INVENTORY_RESERVE"
      primaryAction={{
        label: 'Create Reservation',
        onClick: () => alert('Mock Create Reservation triggered'),
      }}
      emptyState={{
        title: 'No Volumes Reserved',
        description: 'Temporary holds and customer deposits will lock stock automatically to prevent double-selling.',
        actionLabel: 'Reserve Custom Batch',
      }}
    />
  );
}
