import { Supplier } from './supplier.contract';
import { ProductContract } from './product.contract';

export type PurchaseStatus = 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseItem {
  id: string;
  businessId: string;
  purchaseOrderId: string;
  itemId: string;
  quantity: number;
  unitCost: number;
  item?: ProductContract;
}

export interface PurchaseOrder {
  id: string;
  businessId: string;
  supplierId: string;
  status: PurchaseStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
  supplier?: Supplier;
}

export interface CreatePurchaseItemInput {
  itemId: string;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseInput {
  supplierId: string;
  items: CreatePurchaseItemInput[];
  total?: number;
}
