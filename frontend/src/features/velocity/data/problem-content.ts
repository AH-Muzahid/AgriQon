export interface ProblemCard {
  id: string;
  title: string;
  description: string;
  metric: string;
  consequence: string;
}

export const PROBLEM_SECTION_TITLE = "Most Trading Businesses Are Flying Blind.";
export const PROBLEM_SECTION_SUBTITLE =
  "Spreadsheets, WhatsApp groups, disconnected warehouses, and delayed reporting create operational chaos.";

export const PROBLEM_CARDS: ProblemCard[] = [
  {
    id: "whatsapp-void",
    title: "The WhatsApp Void",
    description:
      "Orders, inventory updates, and price approvals are scattered across fragmented group chats.",
    metric: "40% of orders",
    consequence: "subject to manual errors, verbal miscommunications, and missed shipments.",
  },
  {
    id: "warehouse-blindspot",
    title: "The Warehouse Blindspot",
    description:
      "Physical stock counts lag days behind sales activity. You only discover a stockout after the customer orders.",
    metric: "12% stockout rate",
    consequence: "causing direct client attrition to faster regional competitors.",
  },
  {
    id: "frozen-capital",
    title: "Frozen Capital",
    description:
      "Cash is locked up in slow-moving, dead-stock SKUs while high-demand items remain under-provisioned.",
    metric: "28% capital drag",
    consequence: "of inventory capital is frozen in non-moving items for over 90 days.",
  },
  {
    id: "credit-trap",
    title: "The Credit Trap",
    description:
      "Collections lag because sales agents approve orders for high-risk accounts without viewing credit histories.",
    metric: "34 days overdue",
    consequence: "average collection delay, severely restricting weekly purchasing power.",
  },
];
