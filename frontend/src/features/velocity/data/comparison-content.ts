export interface ComparisonRow {
  feature: string;
  traditional: string;
  traditionalDetail: string;
  velocity: string;
  velocityDetail: string;
}

export const COMPARISON_TITLE = "Velocity vs Traditional ERP";
export const COMPARISON_SUBTITLE =
  "Legacy ERPs record history. Velocity predicts and guides your company's next actions.";

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Operational Mode",
    traditional: "Records Transactions",
    traditionalDetail: "Manual database updates after events occur.",
    velocity: "Recommends Actions",
    velocityDetail: "Proactively suggests purchases, transfers, and credit limits.",
  },
  {
    feature: "Insights",
    traditional: "Historical Reports",
    traditionalDetail: "Displays what happened last month or last quarter.",
    velocity: "Predictive Intelligence",
    velocityDetail: "Projects cash flows, demand spikes, and default risks.",
  },
  {
    feature: "Response Model",
    traditional: "Reactive Operations",
    traditionalDetail: "You check reports to discover you ran out of stock.",
    velocity: "Proactive Decisions",
    velocityDetail: "Alerts you 4 days before a stockout with ready-to-sign transfers.",
  },
  {
    feature: "System Footprint",
    traditional: "Disconnected Tools",
    traditionalDetail: "Separate systems for accounting, POS, and warehouses.",
    velocity: "Unified Operating System",
    velocityDetail: "All modules feed a single neural intelligence model.",
  },
  {
    feature: "Primary Function",
    traditional: "Data Storage",
    traditionalDetail: "Acts as a digital ledger sheet of records.",
    velocity: "Operational Intelligence",
    velocityDetail: "Translates ledger numbers into revenue outcomes.",
  },
];
