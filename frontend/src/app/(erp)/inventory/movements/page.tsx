'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function StockMovementsPage() {
  return (
    <ErpPageTemplate
      title="Stock Movements & Logs"
      description="Detailed historical logs of goods received, shipped, or transferred internally between sites."
      permission="INVENTORY_VIEW"
      primaryAction={{
        label: 'Log Transfer',
        onClick: () => alert('Mock Transfer triggered'),
      }}
      emptyState={{
        title: 'No Internal Transfers Logged Today',
        description: 'Operational transfers and delivery check-ins will show up here as they occur in real-time.',
        actionLabel: 'New Internal Transfer',
      }}
    />
  );
}
