'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function FinancialReportsPage() {
  return (
    <ErpPageTemplate
      title="Financial Reports"
      description="Inspect general ledger summaries, balance sheets, profit & loss (P&L) statements."
      permission="REPORT_VIEW"
      primaryAction={{
        label: 'Generate P&L Statement',
        onClick: () => alert('Mock Generate P&L triggered'),
      }}
      emptyState={{
        title: 'All Ledgers Balanced',
        description: 'Trial balances have matched general ledger targets. Review statement logs to confirm quarterly taxes.',
        actionLabel: 'Export General Ledger',
      }}
    />
  );
}
