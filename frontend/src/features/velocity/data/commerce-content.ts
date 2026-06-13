export interface CommerceFeature {
  title: string;
  description: string;
}

export const COMMERCE_SECTION_TITLE = "Built Around How Trade Actually Works.";
export const COMMERCE_SECTION_SUBTITLE =
  "Commerce in emerging markets doesn't happen inside clean browser tabs. It is defined by credit relationships, field agents, complex warehousing, and challenging connectivity.";

export const COMMERCE_FEATURES: CommerceFeature[] = [
  {
    title: "Multi-Warehouse Distribution",
    description:
      "Seamlessly manage stock across remote regional depots, city showrooms, and primary warehouses with automated transfer recommendations.",
  },
  {
    title: "Credit-Based Selling",
    description:
      "Enforce dynamic credit limits, track aging invoices, and assess payment reliability without slowing down sales execution.",
  },
  {
    title: "Field Sales Teams",
    description:
      "Equip field agents with real-time stock availability, instant order booking, and customer ledger histories directly on their mobile devices.",
  },
  {
    title: "Mobile Operations First",
    description:
      "Lightweight, responsive layouts optimized for delivery drivers and warehouse floor managers operating on low-cost smartphones.",
  },
  {
    title: "Intermittent Internet Resilience",
    description:
      "Offline cache support ensures warehouse orders and physical counts sync smoothly even when warehouse connectivity drops.",
  },
  {
    title: "Growing SME Networks",
    description:
      "Onboard sub-distributors, wholesalers, and retail agents into a unified, secure portal for clean order pipelines.",
  },
];
