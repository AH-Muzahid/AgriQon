'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function InventoryReportsPage() {
  return (
    <ErpPageTemplate
      title="Inventory Reports"
      description="Stock turn rates, aging reports, storage usage, and dead stock assessments."
      permission="REPORT_VIEW"
      primaryAction={{
        label: 'Calculate Turn Rate',
        onClick: () => alert('Mock Turn Rate triggered'),
      }}
      emptyState={{
        title: 'Inventory Valuation Audits',
        description: 'Review total value of stocked items, identify slow-moving assets, and adjust replenishment settings.',
        actionLabel: 'Export Valuation PDF',
      }}
    />
  );
}
