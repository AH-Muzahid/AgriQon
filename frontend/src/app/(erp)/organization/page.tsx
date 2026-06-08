'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function OrganizationPage() {
  return (
    <ErpPageTemplate
      title="Organization Overview"
      description="Configure multi-tenant parameters, company details, and linked warehouses."
      permission="ORG_VIEW"
      primaryAction={{
        label: 'Add Branch',
        onClick: () => alert('Mock Add Branch triggered'),
      }}
      emptyState={{
        title: 'No Subsidiary Branches Configured',
        description: 'You are currently operating on the main corporate instance. Create subsidiary branch profiles to segment billing and inventory.',
        actionLabel: 'Create Branch Profile',
      }}
    />
  );
}
