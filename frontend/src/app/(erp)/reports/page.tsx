'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function ReportsPage() {
  return (
    <ErpPageTemplate
      title="Analytical Reports"
      description="View real-time charts on marketing campaigns, inventory velocity, and cash flow schedules."
      permission="REPORT_VIEW"
      primaryAction={{
        label: 'Generate Audit Report',
        onClick: () => alert('Mock Generate Audit Report triggered'),
      }}
      emptyState={{
        title: 'Reporting Dashboard Active',
        description: 'Create customized filter schedules, export PDF sheets, or review tax statements.',
        actionLabel: 'Create Custom Report',
      }}
    />
  );
}
