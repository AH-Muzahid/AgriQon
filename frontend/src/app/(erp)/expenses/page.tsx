'use client';

import React from 'react';
import { ErpPageTemplate } from '@/components/erp-page-template';

export default function ExpensesPage() {
  return (
    <ErpPageTemplate
      title="Corporate Expenses"
      description="Track warehouse utility bills, seed sourcing procurement, transport, and administrative fees."
      permission="EXPENSE_VIEW"
      primaryAction={{
        label: 'Log Expense Voucher',
        onClick: () => alert('Mock Log Expense triggered'),
      }}
      emptyState={{
        title: 'No Active Expense Claims',
        description: 'Vouchers logged by operators or managers will be routed here for approval and ledger matching.',
        actionLabel: 'Log Utility Expense',
      }}
    />
  );
}
