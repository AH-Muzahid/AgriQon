export interface FlowColumn {
  title: string;
  items: string[];
}

export const WHY_VELOCITY_HEADLINE = "Your Competitors Use Software. You Use Intelligence.";
export const WHY_VELOCITY_SUBHEADLINE =
  "Velocity is not another system of record. It is an operating system that works dynamically behind the scenes, scanning database flows to recommend, guide, and automate execution.";

export const DATA_FLOW_TITLE = "Your Business Already Has Data. Velocity Turns It Into Decisions.";
export const DATA_FLOW_COLUMNS: FlowColumn[] = [
  {
    title: "Data",
    items: [
      "Inventory Levels",
      "Warehouse States",
      "Purchase Orders",
      "Sales Invoices",
      "Customer Ledgers",
      "Payment Receipts",
    ],
  },
  {
    title: "Intelligence",
    items: [
      "Demand Forecasting",
      "Credit Risk Scoring",
      "Dead Stock Detection",
      "Cash Flow Prediction",
      "Reorder Triggers",
      "Regional Trend Auditing",
    ],
  },
  {
    title: "Action",
    items: [
      "Automated Purchase Orders",
      "Optimized Stock Transfers",
      "Collection Priority Alerts",
      "Direct Supplier Routing",
      "Proactive Credit Holds",
      "Smart Business Decisions",
    ],
  },
];

export const FOUNDATION_BADGES = [
  "Inventory Engine",
  "Warehouse Network",
  "Purchasing Suite",
  "Sales Ledger",
  "CRM Connector",
  "Double-Entry Accounting",
  "HRM & Payroll",
  "POS Terminal",
  "Granular RBAC",
  "Immutable Audit Logs",
  "Business Analytics",
  "Subscription Engine",
];
