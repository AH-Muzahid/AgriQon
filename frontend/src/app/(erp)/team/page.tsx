'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function TeamPage() {
  return (
    <ErpPageTemplate
      title="Team Directory"
      description="Overview of administrative members, operators, and field managers in this organization."
      permission="TEAM_VIEW"
      primaryAction={{
        label: 'Add Member',
        onClick: () => alert('Mock Add Member triggered'),
      }}
      emptyState={{
        title: 'Team Directory Setup',
        description: 'Manage users, assign security roles, and audit access permissions across the system.',
        actionLabel: 'Invite New User',
      }}
    />
  );
}
