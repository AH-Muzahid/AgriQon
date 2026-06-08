'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function SalesReportsPage() {
  return (
    <ErpPageTemplate
      title="Sales Reports"
      description="Track retail order velocities, regional product demand spikes, and sales representative KPIs."
      permission="REPORT_VIEW"
      primaryAction={{
        label: 'Export CSV',
        onClick: () => alert('Mock Export triggered'),
      }}
      emptyState={{
        title: 'Sales Report generated successfully',
        description: 'Sales numbers are currently within standard deviations. Export database columns to inspect daily line-item logs.',
        actionLabel: 'Export Weekly Sheet',
      }}
    />
  );
}
