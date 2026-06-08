'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function ProductsPage() {
  return (
    <ErpPageTemplate
      title="Master Products List"
      description="Create, edit, and archive stock keeping units (SKUs) and bulk goods definitions."
      permission="PRODUCT_VIEW"
      primaryAction={{
        label: 'Create Product',
        onClick: () => alert('Mock Create Product triggered'),
      }}
      emptyState={{
        title: 'Master Catalog is Empty',
        description: 'You have not added any product files to your active tenant. Define products to begin tracking stock movements.',
        actionLabel: 'Define New SKU',
      }}
    />
  );
}
