'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function SettingsPage() {
  return (
    <ErpPageTemplate
      title="System Settings"
      description="Configure workspace tokens, notification hooks, currency mappings, and database retention schemas."
      permission="SETTINGS_VIEW"
      primaryAction={{
        label: 'Save Configuration',
        onClick: () => alert('Mock Save triggered'),
      }}
      emptyState={{
        title: 'Settings Up To Date',
        description: 'Global workspace parameters are locked to active tenant properties. Modify settings to register webhook channels.',
        actionLabel: 'Modify Active Profile',
      }}
    />
  );
}
