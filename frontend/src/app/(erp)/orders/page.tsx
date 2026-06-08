'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function OrdersPage() {
  return (
    <ErpPageTemplate
      title="Sales Orders"
      description="Process retail purchases, bulk shipments, and marketplace contracts."
      permission="ORDER_VIEW"
      primaryAction={{
        label: 'Create Order',
        onClick: () => alert('Mock Create Order triggered'),
      }}
      emptyState={{
        title: 'No Pending Orders',
        description: 'New consumer marketplace orders and wholesale requests will appear here for packaging and shipping.',
        actionLabel: 'Create Offline Order',
      }}
    />
  );
}
