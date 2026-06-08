import { InventoryContract } from '@/types/contracts/inventory.contract';
import { apiClient } from '../api/client';

export const inventoryMock = {
  async list(): Promise<InventoryContract[]> {
    const items = await apiClient.get<any[]>('/inventory');
    return items.map((inv: any) => ({
      sku: inv.item?.sku || inv.itemId,
      productName: inv.item?.title || 'Unknown Product',
      warehouseId: inv.warehouseId,
      warehouseName: inv.warehouse?.name || 'Unknown Warehouse',
      totalStock: Number(inv.totalStock || 0),
      availableStock: Number(inv.availableStock || 0),
      reservedStock: Number(inv.reservedStock || 0),
      valuation: Number(inv.totalStock || 0) * Number(inv.item?.price || 0),
      status: Number(inv.availableStock || 0) <= 0 
        ? 'OUT_OF_STOCK' 
        : Number(inv.availableStock || 0) <= (inv.item?.lowStockThreshold || 10) 
          ? 'LOW_STOCK' 
          : 'IN_STOCK',
    }));
  },

  async getById(sku: string): Promise<InventoryContract | null> {
    const list = await this.list();
    return list.find((item) => item.sku === sku) || null;
  },

  async create(input: any): Promise<InventoryContract> {
    let itemId = input.itemId;
    if (!itemId && input.sku) {
      // Find item ID by SKU
      try {
        const prodRes = await apiClient.get<any>('/products?limit=100');
        const found = (prodRes.items || []).find((p: any) => p.sku === input.sku || p.id === input.sku);
        if (found) itemId = found.id;
      } catch {}
    }

    const res = await apiClient.post<any>('/inventory/adjust-stock', {
      itemId: itemId || input.sku,
      warehouseId: input.warehouseId,
      quantity: Number(input.totalStock || 0),
      type: 'IN',
      reason: 'Initial adjustment',
    });
    
    return {
      sku: input.sku,
      productName: input.productName || 'Adjusted Product',
      warehouseId: input.warehouseId,
      warehouseName: input.warehouseName || 'Warehouse',
      totalStock: Number(res.totalStock || 0),
      availableStock: Number(res.availableStock || 0),
      reservedStock: Number(res.reservedStock || 0),
      valuation: Number(res.totalStock || 0) * 1500,
      status: 'IN_STOCK',
    };
  },

  async update(sku: string, input: any): Promise<InventoryContract> {
    const list = await this.list();
    // Try matching by SKU or item ID
    const inv = list.find((item) => item.sku === sku);
    if (!inv) throw new Error('Inventory SKU not found');
    
    let itemId = inv.sku; // This might be the SKU or itemId fallback from list()
    try {
      const prodRes = await apiClient.get<any>('/products?limit=100');
      const found = (prodRes.items || []).find((p: any) => p.sku === inv.sku || p.id === inv.sku);
      if (found) itemId = found.id;
    } catch {}

    const currentStock = inv.availableStock;
    const targetStock = Number(input.availableStock ?? input.totalStock ?? currentStock);
    const delta = targetStock - currentStock;
    
    if (delta !== 0) {
      await apiClient.post<any>('/inventory/adjust-stock', {
        itemId: itemId,
        warehouseId: inv.warehouseId,
        quantity: Math.abs(delta),
        type: delta > 0 ? 'IN' : 'OUT',
        reason: 'Manual sync/update',
      });
    }

    return {
      ...inv,
      availableStock: targetStock,
      totalStock: targetStock,
    };
  },

  async delete(sku: string): Promise<boolean> {
    return true;
  },
};
export default inventoryMock;
