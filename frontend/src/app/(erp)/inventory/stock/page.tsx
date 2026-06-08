'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function StockLevelsPage() {
  return (
    <ErpPageTemplate
      title="Warehouse Stock Levels"
      description="Real-time quantities on-hand, committed, and available-to-promise (ATP) across warehouses."
      permission="INVENTORY_VIEW"
      primaryAction={{
        label: 'Print Stock Sheet',
        onClick: () => alert('Mock Print Stock Sheet triggered'),
      }}
      emptyState={{
        title: 'All Warehouses Stocked',
        description: 'Physical stock counts match general ledger estimates. No critical discrepancies detected.',
        actionLabel: 'Perform Physical Count',
      }}
    />
  );
}
