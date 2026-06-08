'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function CategoriesPage() {
  return (
    <ErpPageTemplate
      title="Product Categories"
      description="Manage hierarchical divisions for semantic searching and store catalog grouping."
      permission="PRODUCT_VIEW"
      primaryAction={{
        label: 'Create Category',
        onClick: () => alert('Mock Create Category triggered'),
      }}
      emptyState={{
        title: 'No Categories Configured',
        description: 'Define taxonomies (e.g., Seeds, Fertilizers, Organic Pesticides) to enable advanced analytics grouping.',
        actionLabel: 'Add Category',
      }}
    />
  );
}
