import { InventoryContract, CreateStockAdjustmentInput } from '@/types/contracts/inventory.contract';
import { MOCK_INVENTORY } from '@/lib/mock-erp-data';

export const inventoryMock = {
  async list(): Promise<InventoryContract[]> {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_INVENTORY as any[] as InventoryContract[]), 100));
  },

  async getById(sku: string): Promise<InventoryContract | null> {
    return new Promise((resolve) => {
      const inv = MOCK_INVENTORY.find((item) => item.sku === sku);
      setTimeout(() => resolve((inv as any as InventoryContract) || null), 100);
    });
  },

  async create(input: any): Promise<InventoryContract> {
    return new Promise((resolve) => {
      const created: InventoryContract = {
        ...input,
        valuation: input.totalStock * 1500,
        status: 'IN_STOCK',
      };
      setTimeout(() => resolve(created), 100);
    });
  },

  async update(sku: string, input: any): Promise<InventoryContract> {
    return new Promise((resolve, reject) => {
      const inv = MOCK_INVENTORY.find((item) => item.sku === sku);
      if (!inv) return reject(new Error('Inventory SKU not found'));
      const updated: InventoryContract = {
        ...(inv as any as InventoryContract),
        ...input,
      };
      setTimeout(() => resolve(updated), 100);
    });
  },

  async delete(sku: string): Promise<boolean> {
    return new Promise((resolve) => setTimeout(() => resolve(true), 100));
  },
};
export default inventoryMock;
