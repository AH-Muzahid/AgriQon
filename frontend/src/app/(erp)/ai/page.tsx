'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function AiAssistantPage() {
  return (
    <ErpPageTemplate
      title="AgroAI Control Panel"
      description="Access semantic search engines, demand forecasting algorithms, and RAG invoice processing models."
      permission="AI_ACCESS"
      primaryAction={{
        label: 'Optimize Parameters',
        onClick: () => alert('Mock Optimize triggered'),
      }}
      emptyState={{
        title: 'AgroAI Core Models Active',
        description: 'NLP modules are currently waiting for queries. Use the sidebar AI assistant widget or trigger automated audit scans.',
        actionLabel: 'Launch Batch Optimization',
      }}
    />
  );
}
