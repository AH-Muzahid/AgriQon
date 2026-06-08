'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Warehouse,
  AlertTriangle,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const MOCK_METRICS = [
  {
    title: 'Total Revenue',
    value: '৳2,450,890',
    change: '+12.5%',
    trend: 'up',
    timeframe: 'vs last month',
    icon: DollarSign,
    color: 'text-emerald-600 bg-emerald-500/10',
  },
  {
    title: 'Sales Orders',
    value: '1,842',
    change: '+8.2%',
    trend: 'up',
    timeframe: 'vs last week',
    icon: ShoppingCart,
    color: 'text-blue-600 bg-blue-500/10',
  },
  {
    title: 'Active Customers',
    value: '842',
    change: '+15.4%',
    trend: 'up',
    timeframe: 'vs last quarter',
    icon: Users,
    color: 'text-violet-600 bg-violet-500/10',
  },
  {
    title: 'Inventory Value',
    value: '৳4,890,200',
    change: '-2.1%',
    trend: 'down',
    timeframe: 'vs yesterday',
    icon: Warehouse,
    color: 'text-amber-600 bg-amber-500/10',
  },
];

const MOCK_CHART_DATA = [
  { month: 'Jan', revenue: 180000, expenses: 110000 },
  { month: 'Feb', revenue: 220000, expenses: 130000 },
  { month: 'Mar', revenue: 250000, expenses: 140000 },
  { month: 'Apr', revenue: 210000, expenses: 125000 },
  { month: 'May', revenue: 290000, expenses: 150000 },
  { month: 'Jun', revenue: 320000, expenses: 165000 },
  { month: 'Jul', revenue: 380000, expenses: 180000 },
];

const LOW_STOCK_ITEMS = [
  { name: 'NPK Fertilizer (50kg)', sku: 'AGR-NPK-001', stock: 12, unit: 'bags' },
  { name: 'Organic Compost (25kg)', sku: 'AGR-CMP-005', stock: 5, unit: 'bags' },
  { name: 'Hybrid Rice Seeds', sku: 'AGR-RCE-012', stock: 8, unit: 'kg' },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Executive Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time analytics and management controller for Agriqon ERP.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 cursor-pointer font-semibold shadow-sm">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            AI Forecast
          </Button>
          <Button className="gap-2 cursor-pointer font-semibold shadow-sm">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_METRICS.map((metric) => (
          <Card key={metric.title} className="border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {metric.title}
              </span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${metric.color}`}>
                <metric.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1.5 mt-2">
                {metric.trend === 'up' ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                )}
                <span
                  className={`text-xs font-bold ${
                    metric.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {metric.change}
                </span>
                <span className="text-xs text-muted-foreground">{metric.timeframe}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts & Side Panels */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sales Trend Chart */}
        <Card className="border shadow-sm md:col-span-2">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-base font-semibold">Financial Overview</CardTitle>
            <CardDescription>Monthly revenue and operational expenses comparison</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" style={{ fontSize: 11 }} />
                <YAxis style={{ fontSize: 11 }} tickFormatter={(v) => `৳${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => [`৳${v}`, '']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  name="Revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
                <Area
                  name="Expenses"
                  type="monotone"
                  dataKey="expenses"
                  stroke="#94a3b8"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border shadow-sm flex flex-col justify-between">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Critical Stock Alerts
            </CardTitle>
            <CardDescription>Items below minimum safety threshold</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 py-4 flex flex-col justify-between">
            <div className="grid gap-3">
              {LOW_STOCK_ITEMS.map((item) => (
                <div key={item.sku} className="flex items-center justify-between border-b pb-2 text-xs">
                  <div className="grid gap-0.5">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[10px] text-muted-foreground">SKU: {item.sku}</span>
                  </div>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 font-bold text-rose-600">
                    {item.stock} {item.unit}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full text-xs font-semibold mt-4 gap-1 justify-center cursor-pointer">
              Go to Inventory
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
