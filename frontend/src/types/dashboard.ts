export interface MetricCard {
  title: string;
  value: string | number;
  change: number; // percentage change e.g. +12.5% or -3.2%
  trend: 'up' | 'down' | 'neutral';
  timeframe: string;
  icon?: string;
}

export interface SalesChartData {
  date: string;
  revenue: number;
  expenses: number;
}

export interface InventoryStatusData {
  category: string;
  stockCount: number;
  value: number;
}
