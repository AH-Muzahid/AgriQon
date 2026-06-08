'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function TeamUsersPage() {
  return (
    <ErpPageTemplate
      title="User Management"
      description="Grant dashboard access and allocate tenants to members."
      permission="TEAM_VIEW"
      primaryAction={{
        label: 'Create User',
        onClick: () => alert('Mock Create User triggered'),
      }}
      emptyState={{
        title: 'Only Primary Owner Account Configured',
        description: 'Invite members of your supply-chain, finance, or retail teams to give them scoped dashboard access.',
        actionLabel: 'Invite Member',
      }}
    />
  );
}
