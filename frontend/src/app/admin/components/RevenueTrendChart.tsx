'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DashboardWidget } from './DashboardWidget';

interface RevenueTrendChartProps {
  summary: any;
  loading: boolean;
}

export function RevenueTrendChart({ summary, loading }: RevenueTrendChartProps) {
  return (
    <DashboardWidget
      title="SaaS Revenue Growth Trend"
      description="Estimated MRR over last 6 months (Future-proof template)"
      loading={loading}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={summary?.trends?.revenueTrends || []}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
          <Area type="monotone" dataKey="revenue" name="Estimated MRR" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
        </AreaChart>
      </ResponsiveContainer>
    </DashboardWidget>
  );
}
