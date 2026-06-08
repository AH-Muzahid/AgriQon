export interface InventoryContract {
  sku: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  valuation: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface StockMovementContract {
  id: string;
  date: string;
  sku: string;
  productName: string;
  warehouseName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN' | 'TRANSFER';
  quantity: number;
  reference: string;
}

export interface StockAdjustmentContract {
  id: string;
  date: string;
  sku: string;
  productName: string;
  warehouseName: string;
  type: 'DAMAGE' | 'MANUAL';
  quantity: number;
  reason: string;
  reporter: string;
}

export interface CreateStockAdjustmentInput {
  sku: string;
  warehouseId: string;
  type: 'DAMAGE' | 'MANUAL';
  quantity: number;
  reason: string;
}

export interface CreateStockMovementInput {
  sku: string;
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  type: 'IN' | 'OUT' | 'TRANSFER';
  quantity: number;
  reference: string;
}
