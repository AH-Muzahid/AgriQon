'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DashboardWidget } from './DashboardWidget';

interface GatewayDistributionChartProps {
  summary: any;
  loading: boolean;
  formatBDT: (amount: number) => string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

export function GatewayDistributionChart({ summary, loading, formatBDT }: GatewayDistributionChartProps) {
  return (
    <DashboardWidget
      title="Payment Gateway Distribution"
      description="Success volume share by payment channel"
      loading={loading}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={summary?.payments?.gatewayDistribution || []}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="amount"
            nameKey="gateway"
            label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
          >
            {(summary?.payments?.gatewayDistribution || []).map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatBDT(Number(value))} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </DashboardWidget>
  );
}
