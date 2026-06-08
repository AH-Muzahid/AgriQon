'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function InvoicesPage() {
  return (
    <ErpPageTemplate
      title="Customer Invoices"
      description="Issue tax-compliant bills, track receivables, and configure payment terms."
      permission="INVOICE_VIEW"
      primaryAction={{
        label: 'Issue Invoice',
        onClick: () => alert('Mock Issue Invoice triggered'),
      }}
      emptyState={{
        title: 'All Invoices Settled',
        description: 'No outstanding bills are waiting for payment. Great job following up on receivables!',
        actionLabel: 'Draft New Invoice',
      }}
    />
  );
}
