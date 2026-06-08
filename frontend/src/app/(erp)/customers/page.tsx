'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function CustomersPage() {
  return (
    <ErpPageTemplate
      title="Customers Directory"
      description="Manage farmer profiles, retail buyers, distribution partners, and credit parameters."
      permission="PRODUCT_VIEW"
      primaryAction={{
        label: 'Register Customer',
        onClick: () => alert('Mock Register Customer triggered'),
      }}
      emptyState={{
        title: 'Customer Directory is Empty',
        description: 'Store client data, track historical orders, and define credit terms to streamline sales.',
        actionLabel: 'Add First Customer',
      }}
    />
  );
}
