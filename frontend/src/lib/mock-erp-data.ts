import { ErpStatus } from '@/components/status-badge';

export interface MockProduct {
  sku: string;
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  sellingPrice: number;
  status: ErpStatus;
  description: string;
}

export interface MockInventory {
  sku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  valuation: number;
  status: ErpStatus;
}

export interface MockMovement {
  id: string;
  date: string;
  sku: string;
  productName: string;
  warehouseName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER';
  quantity: number;
  reference: string;
}

export interface MockAdjustment {
  id: string;
  date: string;
  sku: string;
  productName: string;
  warehouseName: string;
  type: 'DAMAGE' | 'MANUAL';
  quantity: number; // e.g. -5 for damage, +2 for manual correction
  reason: string;
  reporter: string;
}

export interface MockCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  purchasesCount: number;
  totalSpent: number;
  dueAmount: number;
  status: ErpStatus;
  timeline: { date: string; event: string; type: string }[];
}

export interface MockOrder {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  status: ErpStatus;
  items: { sku: string; name: string; qty: number; price: number }[];
  timeline: { date: string; status: ErpStatus; desc: string }[];
}

export interface MockInvoice {
  id: string;
  invoiceNo: string;
  orderId: string;
  customerName: string;
  date: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: ErpStatus;
}

export interface MockPayment {
  id: string;
  paymentNo: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  amount: number;
  method: 'Bank Transfer' | 'MFS (bKash/Nagad)' | 'Cash' | 'Credit Card';
  status: ErpStatus;
}

// 1. Agricultural Products Data
export const MOCK_PRODUCTS: MockProduct[] = [
  {
    sku: 'AGR-NPK-001',
    name: 'NPK Fertilizer (50kg)',
    category: 'Fertilizer',
    brand: 'Golden Harvest',
    costPrice: 1200.0,
    sellingPrice: 1650.0,
    status: 'ACTIVE',
    description: 'High-nitrogen concentrated granular fertilizer for general crop root fortification.',
  },
  {
    sku: 'AGR-CMP-005',
    name: 'Organic Compost (25kg)',
    category: 'Fertilizer',
    brand: 'SoilVigor',
    costPrice: 350.0,
    sellingPrice: 500.0,
    status: 'ACTIVE',
    description: 'Decomposed organic humus for enrichment of sandy soil texture and moisture hold.',
  },
  {
    sku: 'AGR-RCE-012',
    name: 'Hybrid Rice Seeds (BRRI-28)',
    category: 'Seeds',
    brand: 'AgroSeed Co',
    costPrice: 450.0,
    sellingPrice: 650.0,
    status: 'ACTIVE',
    description: 'Certified hybrid high-yield paddy seeds designed for monsoon planting cycles.',
  },
  {
    sku: 'AGR-PSC-008',
    name: 'Pesticide Concentrate (1L)',
    category: 'Pest Control',
    brand: 'InsectiShield',
    costPrice: 850.0,
    sellingPrice: 1200.0,
    status: 'ACTIVE',
    description: 'Liquid foliage systemic insecticide for controlling leaf-miner infestation.',
  },
  {
    sku: 'AGR-PMP-102',
    name: 'Diesel Irrigation Pump 5HP',
    category: 'Equipment',
    brand: 'Kirloskar Engine',
    costPrice: 18000.0,
    sellingPrice: 22500.0,
    status: 'ACTIVE',
    description: 'High-volume water pumps for canal-to-field flood irrigation setups.',
  },
  {
    sku: 'AGR-SHV-091',
    name: 'Steel Agricultural Shovels',
    category: 'Tools',
    brand: 'Tata Agrico',
    costPrice: 220.0,
    sellingPrice: 350.0,
    status: 'ACTIVE',
    description: 'Tempered carbon steel flat-blade digging spade tools with heavy-duty ashwood shaft.',
  },
  {
    sku: 'AGR-UAA-004',
    name: 'Urea Fertilizer (Bulk)',
    category: 'Fertilizer',
    brand: 'KAFCO',
    costPrice: 950.0,
    sellingPrice: 1350.0,
    status: 'INACTIVE',
    description: 'Bulk urea nitrogen compound for early vegetative plant leaf growth boost.',
  },
];

// 2. Inventory Stock Data
export const MOCK_INVENTORY: MockInventory[] = [
  {
    sku: 'AGR-NPK-001',
    productName: 'NPK Fertilizer (50kg)',
    warehouseId: 'wh_dhaka_main',
    warehouseName: 'Dhaka Central Hub',
    totalStock: 250,
    availableStock: 220,
    reservedStock: 30,
    valuation: 412500.0,
    status: 'IN_STOCK',
  },
  {
    sku: 'AGR-CMP-005',
    productName: 'Organic Compost (25kg)',
    warehouseId: 'wh_dhaka_main',
    warehouseName: 'Dhaka Central Hub',
    totalStock: 12,
    availableStock: 12,
    reservedStock: 0,
    valuation: 6000.0,
    status: 'LOW_STOCK',
  },
  {
    sku: 'AGR-RCE-012',
    productName: 'Hybrid Rice Seeds (BRRI-28)',
    warehouseId: 'wh_bogura_cold',
    warehouseName: 'Bogura Cold Storage',
    totalStock: 80,
    availableStock: 65,
    reservedStock: 15,
    valuation: 52000.0,
    status: 'IN_STOCK',
  },
  {
    sku: 'AGR-PSC-008',
    productName: 'Pesticide Concentrate (1L)',
    warehouseId: 'wh_dhaka_main',
    warehouseName: 'Dhaka Central Hub',
    totalStock: 15,
    availableStock: 5,
    reservedStock: 10,
    valuation: 18000.0,
    status: 'LOW_STOCK',
  },
  {
    sku: 'AGR-PMP-102',
    productName: 'Diesel Irrigation Pump 5HP',
    warehouseId: 'wh_dhaka_main',
    warehouseName: 'Dhaka Central Hub',
    totalStock: 4,
    availableStock: 4,
    reservedStock: 0,
    valuation: 90000.0,
    status: 'IN_STOCK',
  },
  {
    sku: 'AGR-SHV-091',
    productName: 'Steel Agricultural Shovels',
    warehouseId: 'wh_bogura_cold',
    warehouseName: 'Bogura Cold Storage',
    totalStock: 150,
    availableStock: 150,
    reservedStock: 0,
    valuation: 52500.0,
    status: 'IN_STOCK',
  },
];

// 3. Inventory Stock Movements Logs
export const MOCK_MOVEMENTS: MockMovement[] = [
  {
    id: 'mvt_001',
    date: '2026-06-08T09:12:00Z',
    sku: 'AGR-NPK-001',
    productName: 'NPK Fertilizer (50kg)',
    warehouseName: 'Dhaka Central Hub',
    type: 'IN',
    quantity: 500,
    reference: 'PO-2026-0982',
  },
  {
    id: 'mvt_002',
    date: '2026-06-08T10:30:00Z',
    sku: 'AGR-RCE-012',
    productName: 'Hybrid Rice Seeds (BRRI-28)',
    warehouseName: 'Bogura Cold Storage',
    type: 'OUT',
    quantity: 15,
    reference: 'SO-2026-4432',
  },
  {
    id: 'mvt_003',
    date: '2026-06-07T14:22:00Z',
    sku: 'AGR-PSC-008',
    productName: 'Pesticide Concentrate (1L)',
    warehouseName: 'Dhaka Central Hub',
    type: 'TRANSFER',
    quantity: 50,
    reference: 'WH-TR-0043',
  },
  {
    id: 'mvt_004',
    date: '2026-06-06T11:05:00Z',
    sku: 'AGR-CMP-005',
    productName: 'Organic Compost (25kg)',
    warehouseName: 'Dhaka Central Hub',
    type: 'ADJUSTMENT',
    quantity: -5,
    reference: 'ADJ-DMG-002',
  },
];

// 4. Inventory Adjustments & Damage Reports
export const MOCK_ADJUSTMENTS: MockAdjustment[] = [
  {
    id: 'adj_001',
    date: '2026-06-06T11:05:00Z',
    sku: 'AGR-CMP-005',
    productName: 'Organic Compost (25kg)',
    warehouseName: 'Dhaka Central Hub',
    type: 'DAMAGE',
    quantity: -5,
    reason: 'Water damage due to roof leakage in Zone B.',
    reporter: 'Siddik Ali (Wh Head)',
  },
  {
    id: 'adj_002',
    date: '2026-06-04T15:40:00Z',
    sku: 'AGR-PMP-102',
    productName: 'Diesel Irrigation Pump 5HP',
    warehouseName: 'Dhaka Central Hub',
    type: 'MANUAL',
    quantity: 1,
    reason: 'Found physical pump unit in bay during annual inventory check.',
    reporter: 'Fahim Ahmed (Auditor)',
  },
];

// 5. Customer Registry Data
export const MOCK_CUSTOMERS: MockCustomer[] = [
  {
    id: 'cust_001',
    name: 'Rahim Agritech Farms',
    email: 'contact@rahimfarms.com',
    phone: '+880 1711-223344',
    address: 'Natore Sadar, Natore',
    purchasesCount: 42,
    totalSpent: 854000.0,
    dueAmount: 45000.0,
    status: 'ACTIVE',
    timeline: [
      { date: '2026-06-08', event: 'Placed Sales Order SO-2026-4432', type: 'order' },
      { date: '2026-06-02', event: 'Cleared Outstanding Invoice INV-8821 for ৳50,000', type: 'payment' },
      { date: '2026-05-25', event: 'Reported delayed seed delivery log', type: 'ticket' },
    ],
  },
  {
    id: 'cust_002',
    name: 'Bari Seed Distributors',
    email: 'bari@seed-bd.org',
    phone: '+880 1922-887766',
    address: 'Sherpur, Bogura',
    purchasesCount: 18,
    totalSpent: 420000.0,
    dueAmount: 0.0,
    status: 'ACTIVE',
    timeline: [
      { date: '2026-06-05', event: 'Completed payment voucher validation', type: 'payment' },
      { date: '2026-05-18', event: 'Requested bulk quote for Hybrid Seeds', type: 'inquiry' },
    ],
  },
  {
    id: 'cust_003',
    name: 'Sarkar Agro Industries',
    email: 'info@sarkaragro.com',
    phone: '+880 1833-445566',
    address: 'Jessore Cantonment, Jessore',
    purchasesCount: 12,
    totalSpent: 310000.0,
    dueAmount: 112000.0,
    status: 'ACTIVE',
    timeline: [
      { date: '2026-06-04', event: 'Invoice INV-8825 generated with ৳112,000 due', type: 'invoice' },
      { date: '2026-06-01', event: 'Requested extension on payment terms', type: 'finance' },
    ],
  },
];

// 6. Sales Orders
export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'SO-2026-4432',
    date: '2026-06-08T10:30:00Z',
    customerId: 'cust_001',
    customerName: 'Rahim Agritech Farms',
    totalAmount: 9750.0,
    status: 'CONFIRMED',
    items: [
      { sku: 'AGR-RCE-012', name: 'Hybrid Rice Seeds (BRRI-28)', qty: 15, price: 650.0 },
    ],
    timeline: [
      { date: '2026-06-08T10:30:00Z', status: 'PENDING', desc: 'Order submitted by sales agent.' },
      { date: '2026-06-08T10:45:00Z', status: 'CONFIRMED', desc: 'Order confirmed and inventory locked.' },
    ],
  },
  {
    id: 'SO-2026-4431',
    date: '2026-06-07T08:15:00Z',
    customerId: 'cust_002',
    customerName: 'Bari Seed Distributors',
    totalAmount: 34500.0,
    status: 'DELIVERED',
    items: [
      { sku: 'AGR-NPK-001', name: 'NPK Fertilizer (50kg)', qty: 20, price: 1650.0 },
      { sku: 'AGR-CMP-005', name: 'Organic Compost (25kg)', qty: 3, price: 500.0 },
    ],
    timeline: [
      { date: '2026-06-07T08:15:00Z', status: 'PENDING', desc: 'Order created.' },
      { date: '2026-06-07T09:00:00Z', status: 'CONFIRMED', desc: 'Order approved.' },
      { date: '2026-06-07T13:30:00Z', status: 'PROCESSING', desc: 'Packed at Dhaka Central Hub.' },
      { date: '2026-06-08T09:40:00Z', status: 'DELIVERED', desc: 'Received and signed at Sherpur.' },
    ],
  },
  {
    id: 'SO-2026-4430',
    date: '2026-06-06T15:20:00Z',
    customerId: 'cust_003',
    customerName: 'Sarkar Agro Industries',
    totalAmount: 112000.0,
    status: 'PROCESSING',
    items: [
      { sku: 'AGR-PMP-102', name: 'Diesel Irrigation Pump 5HP', qty: 4, price: 22500.0 },
      { sku: 'AGR-PSC-008', name: 'Pesticide Concentrate (1L)', qty: 18, price: 1200.0 },
    ],
    timeline: [
      { date: '2026-06-06T15:20:00Z', status: 'PENDING', desc: 'Bulk order signed.' },
      { date: '2026-06-06T16:00:00Z', status: 'CONFIRMED', desc: 'Financial audit approved.' },
      { date: '2026-06-08T08:00:00Z', status: 'PROCESSING', desc: 'Sourcing units from cold reserves.' },
    ],
  },
];

// 7. Customer Invoices
export const MOCK_INVOICES: MockInvoice[] = [
  {
    id: 'inv_8820',
    invoiceNo: 'INV-2026-8820',
    orderId: 'SO-2026-4431',
    customerName: 'Bari Seed Distributors',
    date: '2026-06-07',
    dueDate: '2026-06-22',
    totalAmount: 34500.0,
    paidAmount: 34500.0,
    dueAmount: 0.0,
    status: 'PAID',
  },
  {
    id: 'inv_8821',
    invoiceNo: 'INV-2026-8821',
    orderId: 'SO-2026-4432',
    customerName: 'Rahim Agritech Farms',
    date: '2026-06-08',
    dueDate: '2026-06-23',
    totalAmount: 9750.0,
    paidAmount: 0.0,
    dueAmount: 9750.0,
    status: 'UNPAID',
  },
  {
    id: 'inv_8822',
    invoiceNo: 'INV-2026-8822',
    orderId: 'SO-2026-4430',
    customerName: 'Sarkar Agro Industries',
    date: '2026-06-06',
    dueDate: '2026-06-21',
    totalAmount: 112000.0,
    paidAmount: 0.0,
    dueAmount: 112000.0,
    status: 'UNPAID',
  },
];

// 8. Cash Payments
export const MOCK_PAYMENTS: MockPayment[] = [
  {
    id: 'pay_001',
    paymentNo: 'PMT-2026-0091',
    invoiceNo: 'INV-2026-8820',
    date: '2026-06-07T11:45:00Z',
    customerName: 'Bari Seed Distributors',
    amount: 34500.0,
    method: 'MFS (bKash/Nagad)',
    status: 'SUCCESS',
  },
  {
    id: 'pay_002',
    paymentNo: 'PMT-2026-0092',
    invoiceNo: 'INV-2026-8819',
    date: '2026-06-02T10:15:00Z',
    customerName: 'Rahim Agritech Farms',
    amount: 50000.0,
    method: 'Bank Transfer',
    status: 'SUCCESS',
  },
];
