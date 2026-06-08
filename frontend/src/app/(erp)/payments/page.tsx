'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function PaymentsPage() {
  return (
    <ErpPageTemplate
      title="Payments & Gateway"
      description="Record bank transfers, mobile financial service (MFS) tokens, and credit collections."
      permission="PAYMENT_VIEW"
      primaryAction={{
        label: 'Record Payment',
        onClick: () => alert('Mock Record Payment triggered'),
      }}
      emptyState={{
        title: 'No Payments Logged Today',
        description: 'Payment transactions logged via payment gateways or manual cash records will populate the ledger here.',
        actionLabel: 'Log Manual Payment',
      }}
    />
  );
}
