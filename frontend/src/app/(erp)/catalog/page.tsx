'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function CatalogPage() {
  return (
    <ErpPageTemplate
      title="Product Catalog"
      description="Manage agricultural goods, fertilizers, seeds, and equipment parameters."
      permission="PRODUCT_VIEW"
      primaryAction={{
        label: 'Register Product',
        onClick: () => alert('Mock Register Product triggered'),
      }}
      emptyState={{
        title: 'Master Catalog Setup',
        description: 'Organize products, configure tax classifications, specify barcodes, and define size variants.',
        actionLabel: 'Define Product Category',
      }}
    />
  );
}
