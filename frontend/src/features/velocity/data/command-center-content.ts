export interface AIResponseStep {
  label: string;
  detail: string;
}

export interface AIPromptExample {
  id: string;
  prompt: string;
  category: string;
  response: {
    outcome: string;
    reasoning: string[];
    recommendation: string;
    confidence: number;
    metrics: { label: string; value: string; trend?: string }[];
  };
}

export const COMMAND_CENTER_TITLE = "Your Business Now Speaks Back.";
export const COMMAND_CENTER_SUBTITLE =
  "Ask natural language operational questions. Receive instant predictive analyses, audit trails, and ready-to-execute draft orders.";

export const COMMAND_CENTER_PROMPTS: AIPromptExample[] = [
  {
    id: "late-payments",
    prompt: "Which customers are likely to pay late this month?",
    category: "Credit Intelligence",
    response: {
      outcome: "Identified 3 accounts with High Late-Payment Probability.",
      reasoning: [
        "Rahman Traders outstanding balance is ৳1,250,000, credit utilization at 94%. Historical delay pattern suggests an 18-day payment lag.",
        "Miah Wholesalers regional delivery delays have extended their cash conversion cycle by 12 days.",
        "Chowdhury & Sons average payment velocity slowed by 8% over the last 3 monthly invoice cycles.",
      ],
      recommendation:
        "Temporarily restrict credit limit for Rahman Traders to ৳800,000 and queue an automated collection reminder in Whatsapp for Chowdhury & Sons.",
      confidence: 89,
      metrics: [
        { label: "High-Risk Exposure", value: "৳2,450,000" },
        { label: "Expected Collections Delay", value: "14 Days", trend: "+3 days" },
      ],
    },
  },
  {
    id: "reorders",
    prompt: "Which products should I reorder this week?",
    category: "Inventory Intelligence",
    response: {
      outcome: "2 SKUs are at risk of stockout before the next shipment arrival.",
      reasoning: [
        "SKU-908 (Lubricant) run-rate has spiked to 75 units/day (historical average: 52/day) in the Central Depot.",
        "SKU-104 (Generator Parts) lead time from Supplier X increased by 5 days due to shipping port logs.",
      ],
      recommendation:
        "Draft purchase order for 500 units of SKU-908 and reroute 150 units from Warehouse 2 to cover the 4-day coverage gap.",
      confidence: 94,
      metrics: [
        { label: "Stockout Risk", value: "4 Days Left" },
        { label: "Potential Sales Saved", value: "৳480,000" },
      ],
    },
  },
  {
    id: "sales-decline",
    prompt: "Why are sales declining in the South region?",
    category: "Business Intelligence",
    response: {
      outcome: "Sales volume dropped 14% due to competitor discount campaigns and distributor stockouts.",
      reasoning: [
        "Regional distributor stockouts of core SKU-800 reduced dealer order frequencies by 11%.",
        "Competitor 'Alfa Brands' launched a 4.5% wholesale discount scheme on lubricants, impacting key dealer margins.",
      ],
      recommendation:
        "Deploy a targeted 3% dealer volume discount on SKU-800 for South Region distributors and authorize a stock transfer of 400 units to regional depot.",
      confidence: 86,
      metrics: [
        { label: "South Region Sales", value: "৳1,890,000", trend: "-14% MoM" },
        { label: "Distributor Coverage", value: "76%", trend: "-8%" },
      ],
    },
  },
  {
    id: "generate-po",
    prompt: "Generate a purchase order for Supplier X.",
    category: "Automation",
    response: {
      outcome: "Draft Purchase Order PO-2026-884 Generated.",
      reasoning: [
        "Calculated replenishment quantities based on 21-day safety stock and lead times.",
        "Verified unit cost pricing matches active Supplier X contract agreements.",
      ],
      recommendation:
        "Review and sign draft PO-2026-884 for 600 units of mixed lubricants (Value: ৳750,000). Ready for integration submit.",
      confidence: 99,
      metrics: [
        { label: "Supplier", value: "lubriCorp Ltd" },
        { label: "Items Count", value: "3 SKUs" },
      ],
    },
  },
];
