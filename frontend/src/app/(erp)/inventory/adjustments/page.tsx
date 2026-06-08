'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function StockAdjustmentsPage() {
  return (
    <ErpPageTemplate
      title="Stock Adjustments"
      description="Record discrepancies, write-offs, damages, and audit corrections."
      permission="INVENTORY_ADJUST"
      primaryAction={{
        label: 'Create Adjustment',
        onClick: () => alert('Mock Create Adjustment triggered'),
      }}
      emptyState={{
        title: 'No Adjustments Required',
        description: 'Physical inventory levels are aligned with digital ledger records. Register an adjustment if stock damage is found.',
        actionLabel: 'Report Stock Damage',
      }}
    />
  );
}
