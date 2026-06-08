'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function WarehousesPage() {
  return (
    <ErpPageTemplate
      title="Warehouses & Hubs"
      description="Register logistical storage sites, cold stores, and central distribution hubs."
      permission="INVENTORY_VIEW"
      primaryAction={{
        label: 'Register Warehouse',
        onClick: () => alert('Mock Register Warehouse triggered'),
      }}
      emptyState={{
        title: 'No Secondary Warehouses Registered',
        description: 'You are currently utilizing default warehouse nodes. Register new physical nodes to enable stock transfer and multi-site inventory tracking.',
        actionLabel: 'Register Site',
      }}
    />
  );
}
