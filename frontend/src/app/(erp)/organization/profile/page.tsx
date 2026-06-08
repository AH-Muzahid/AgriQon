'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function OrganizationProfilePage() {
  return (
    <ErpPageTemplate
      title="Company Profile"
      description="Manage tax identifiers, fiscal years, legal entity naming, and currency settings."
      permission="ORG_VIEW"
      primaryAction={{
        label: 'Edit Settings',
        onClick: () => alert('Mock Edit Settings triggered'),
      }}
      emptyState={{
        title: 'Profile Metadata is Complete',
        description: 'Your business profile settings are up to date. No configuration actions are required at this time.',
        actionLabel: 'Update Profile Details',
      }}
    />
  );
}
