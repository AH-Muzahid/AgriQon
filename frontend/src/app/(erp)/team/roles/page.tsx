'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function TeamRolesPage() {
  return (
    <ErpPageTemplate
      title="Access Control Roles"
      description="Create logical job roles mapping to system permission sets (e.g., Accountant, Inventory Manager)."
      permission="TEAM_MANAGE"
      primaryAction={{
        label: 'Create Custom Role',
        onClick: () => alert('Mock Create Role triggered'),
      }}
      emptyState={{
        title: 'Default System Roles Active',
        description: 'Standard roles (Owner, Manager, Viewer) are active. Create fine-grained custom roles for custom team permissions.',
        actionLabel: 'Define Custom Role',
      }}
    />
  );
}
