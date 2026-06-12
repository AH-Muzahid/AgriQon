'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { DashboardWidget } from './DashboardWidget';

interface FunnelDistributionChartProps {
  summary: any;
  loading: boolean;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

export function FunnelDistributionChart({ summary, loading }: FunnelDistributionChartProps) {
  const chartData = [
    { name: 'Trial', count: summary?.funnel?.TRIAL || 0 },
    { name: 'Active Paid', count: summary?.funnel?.ACTIVE || 0 },
    { name: 'Grace Period', count: summary?.funnel?.GRACE_PERIOD || 0 },
    { name: 'Suspended', count: summary?.funnel?.SUSPENDED || 0 },
    { name: 'Cancelled', count: summary?.funnel?.CANCELLED || 0 },
  ];

  return (
    <DashboardWidget
      title="Subscription Funnel Distribution"
      description="Total accounts segment counts"
      loading={loading}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
          <Bar dataKey="count" name="Tenants count" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </DashboardWidget>
  );
}
