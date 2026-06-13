export interface StockoutRisk {
  sku: string;
  name: string;
  daysRemaining: number;
  recommendedTransfer: number;
  revenueSaved: number;
  confidence: number;
}

export interface CreditRisk {
  customerName: string;
  riskLevel: "Low" | "Medium" | "High";
  expectedDelayDays: number;
  outstandingAmount: number;
}

export interface DemandForecast {
  productName: string;
  trend: "Rising" | "Falling" | "Stable";
  percentage: number;
  region: string;
}

export const HERO_BADGE = "AI Operating System for Modern Trade";

export const HERO_HEADLINES = [
  "Know What To Stock.",
  "Know What To Buy.",
  "Know What To Do Next.",
];

export const HERO_SUBHEADLINE =
  "Velocity transforms inventory, warehouse, sales, customer, and financial data into real-time operational intelligence for distributors and trading businesses.";

export const TRUST_BADGES = [
  "Distributors",
  "Trading Companies",
  "Wholesalers",
  "Multi-Warehouse Operations",
];

export const STOCKOUT_RISK_DATA: StockoutRisk = {
  sku: "SKU-908",
  name: "Premium Engine Lubricant",
  daysRemaining: 4,
  recommendedTransfer: 300,
  revenueSaved: 480000, // in BDT (৳)
  confidence: 92,
};

export const CREDIT_RISK_DATA: CreditRisk = {
  customerName: "Rahman Traders",
  riskLevel: "High",
  expectedDelayDays: 18,
  outstandingAmount: 1250000,
};

export const DEMAND_FORECAST_DATA: DemandForecast = {
  productName: "Generator Oil",
  trend: "Rising",
  percentage: 21,
  region: "South Region",
};

export const AI_TIMELINE_STEPS = [
  { time: "08:30:12", status: "sync", text: "Warehouse 3 inventory sync completed." },
  { time: "08:30:15", status: "analyze", text: "Analyzing SKU-908 run-rate: demand increased +21%." },
  { time: "08:30:16", status: "warn", text: "Flagged stockout risk for SKU-908 (4 days remaining)." },
  { time: "08:30:17", status: "recommend", text: "Action generated: Transfer 300 units from Warehouse 1." },
];
