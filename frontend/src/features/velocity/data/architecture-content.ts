export interface ArchitectureLayer {
  number: string;
  name: string;
  subtitle: string;
  caption: string;
  details: string[];
}

export const ARCHITECTURE_TITLE = "One Operating System. Three Layers of Intelligence.";

export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    number: "01",
    name: "Operational Foundation",
    subtitle: "The single source of truth.",
    caption:
      "A fast, modern transaction database logging every stock move, sales transaction, purchase, invoice, payment, ledger entry, and organization audit in real-time.",
    details: [
      "Real-time Inventory Tracking",
      "Multi-Warehouse Inventory Ledger",
      "Sales, Purchases, & Invoices",
      "Double-Entry General Ledgers",
      "Granular Team RBAC",
    ],
  },
  {
    number: "02",
    name: "System of Intelligence",
    subtitle: "Data becomes insight.",
    caption:
      "A background processing engine that continuously monitors operational transaction logs to run machine learning forecasts, credit risk scores, and reorder recommendations.",
    details: [
      "21-Day Demand Forecasting",
      "Customer Credit-Risk Scores",
      "Dead Stock & Wastage Audits",
      "Cash Flow Run-rate Predictions",
      "Automated Reorder Thresholds",
    ],
  },
  {
    number: "03",
    name: "System of Action",
    subtitle: "Insight becomes execution.",
    caption:
      "A natural language chat interface and proactive alert panel that lets you query business health, review automatically prepared documents, and authorize transfers in a single click.",
    details: [
      "Natural Language Business Q&A",
      "Auto-generated Purchase Drafts",
      "Pre-verified Credit Hold Approvals",
      "1-Click Stock Allocation",
      "Proactive Stockout Prevention",
    ],
  },
];
